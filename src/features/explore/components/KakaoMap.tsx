"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { env } from "@/src/config/env";
import type { ChatRoom } from "@/src/features/chat/api/chatApi";
import type { KakaoCustomOverlayInstance, KakaoMapInstance, KakaoMapMouseEvent, KakaoMapsApi } from "@/src/shared/types/kakao-maps";
import type { ApproximateLocation } from "../types";
import { clusterRooms, getClusterDistanceMeters } from "../lib/clusterRooms";
import { getDistrictName } from "../lib/getDistrictName";
import { loadKakaoMaps } from "../lib/loadKakaoMaps";

type KakaoMapProps = {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedLocation: ApproximateLocation | null;
  isSelectingLocation: boolean;
  onLocationSelect: (location: ApproximateLocation) => void;
  onLocationSelectCancel: () => void;
  onRoomSelect: (roomId: number) => void;
  onRoomClusterSelect: (roomIds: number[]) => void;
  currentLocation: ApproximateLocation | null;
  rooms: ChatRoom[];
};

const CITY_LEVEL = 9;
const DISTRICT_LEVEL = 6;
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 14;

type MapDisplayMode = "city" | "district" | "room";

function getMapDisplayMode(level: number): MapDisplayMode {
  if (level >= CITY_LEVEL) return "city";
  if (level >= DISTRICT_LEVEL) return "district";
  return "room";
}

export function KakaoMap({
  selectedRegion,
  onRegionChange,
  selectedLocation,
  isSelectingLocation,
  onLocationSelect,
  onLocationSelectCancel,
  onRoomSelect,
  onRoomClusterSelect,
  currentLocation,
  rooms,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsApiRef = useRef<KakaoMapsApi | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlayInstance[]>([]);
  const roomOverlaysRef = useRef<KakaoCustomOverlayInstance[]>([]);
  const selectedLocationOverlayRef = useRef<KakaoCustomOverlayInstance | null>(null);
  const currentLocationOverlayRef = useRef<KakaoCustomOverlayInstance | null>(null);
  const hasFittedRoomsRef = useRef(false);
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>("district");
  const [zoomLevel, setZoomLevel] = useState(8);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadKakaoMaps(env.kakaoMapKey)
      .then((maps) => {
        if (!active || !containerRef.current) return;

        const map = new maps.Map(containerRef.current, {
          center: new maps.LatLng(37.5665, 126.978),
          level: 8,
        });

        mapsApiRef.current = maps;
        mapRef.current = map;
        setReady(true);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "지도를 불러오지 못했습니다.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !map || !maps) return;

    const syncDisplayMode = () => {
      const level = map.getLevel();
      const nextMode = getMapDisplayMode(level);
      setZoomLevel(level);
      setDisplayMode((currentMode) =>
        currentMode === nextMode ? currentMode : nextMode,
      );
    };

    syncDisplayMode();
    maps.event.addListener(map, "idle", syncDisplayMode);

    return () => maps.event.removeListener(map, "idle", syncDisplayMode);
  }, [ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !map || !maps || hasFittedRoomsRef.current) return;

    const locatedRooms = rooms.filter(
      (room) => room.latitude !== null && room.longitude !== null,
    );
    if (locatedRooms.length === 0) return;

    hasFittedRoomsRef.current = true;

    if (locatedRooms.length === 1) {
      const room = locatedRooms[0];
      map.setCenter(new maps.LatLng(room.latitude!, room.longitude!));
      map.setLevel(7);
      return;
    }

    const bounds = new maps.LatLngBounds();
    locatedRooms.forEach((room) => {
      bounds.extend(new maps.LatLng(room.latitude!, room.longitude!));
    });
    map.setBounds(bounds, 80, 80, 80, 80);

    if (map.getLevel() < DISTRICT_LEVEL) {
      map.setLevel(DISTRICT_LEVEL);
    }
  }, [ready, rooms]);

  const changeZoom = (direction: "in" | "out") => {
    const map = mapRef.current;
    if (!map) return;

    const nextLevel = Math.min(
      MAX_ZOOM_LEVEL,
      Math.max(MIN_ZOOM_LEVEL, map.getLevel() + (direction === "in" ? -1 : 1)),
    );
    map.setLevel(nextLevel, { animate: true });
  };

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !map || !maps) return;

    const previousOverlays = overlaysRef.current;
    let nextOverlays: KakaoCustomOverlayInstance[] = [];

    if (displayMode === "city") {
      const totalRoomCount = rooms.length;
      if (totalRoomCount === 0) {
        overlaysRef.current = nextOverlays;
        previousOverlays.forEach((overlay) => overlay.setMap(null));
        return;
      }
      const position = new maps.LatLng(37.5665, 126.978);
      const content = document.createElement("button");
      content.type = "button";
      content.className = "city-overlay";
      content.setAttribute("aria-label", `서울특별시, 채팅방 ${totalRoomCount}개`);

      const count = document.createElement("strong");
      count.textContent = `${totalRoomCount}개`;
      const name = document.createElement("small");
      name.textContent = "서울특별시";
      content.append(count, name);
      content.addEventListener("click", () => {
        map.panTo(position);
        map.setLevel(7, { anchor: position, animate: true });
      });

      nextOverlays = [new maps.CustomOverlay({
        map,
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 4,
      })];
      overlaysRef.current = nextOverlays;
      previousOverlays.forEach((overlay) => overlay.setMap(null));
      return;
    }

    if (displayMode !== "district") {
      overlaysRef.current = nextOverlays;
      previousOverlays.forEach((overlay) => overlay.setMap(null));
      return;
    }

    const roomsByRegion = rooms.reduce<Map<string, ChatRoom[]>>((groupedRooms, room) => {
      if (room.latitude === null || room.longitude === null) return groupedRooms;

      const regionName = getDistrictName(room.regionLabel);
      const regionRooms = groupedRooms.get(regionName) ?? [];
      groupedRooms.set(regionName, [...regionRooms, room]);

      return groupedRooms;
    }, new Map());

    nextOverlays = Array.from(roomsByRegion.entries()).map(([regionName, regionRooms]) => {
      const roomCount = regionRooms.length;
      const latitude = regionRooms.reduce((sum, room) => sum + room.latitude!, 0) / roomCount;
      const longitude = regionRooms.reduce((sum, room) => sum + room.longitude!, 0) / roomCount;
      const position = new maps.LatLng(latitude, longitude);
      const content = document.createElement("button");
      content.type = "button";
      content.className = `region-overlay ${selectedRegion === regionName ? "active" : ""}`;
      content.setAttribute("aria-label", `${regionName}, 채팅방 ${roomCount}개`);

      const count = document.createElement("strong");
      count.textContent = `${roomCount}개`;
      const name = document.createElement("small");
      name.textContent = regionName;
      content.append(count, name);

      content.addEventListener("click", () => {
        onRegionChange(regionName);
        setFocusedRegion(regionName);
        map.panTo(position);
        map.setLevel(5, { anchor: position, animate: true });
      });

      return new maps.CustomOverlay({
        map,
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: selectedRegion === regionName ? 4 : 3,
      });
    });

    overlaysRef.current = nextOverlays;
    previousOverlays.forEach((overlay) => overlay.setMap(null));
  }, [displayMode, onRegionChange, ready, rooms, selectedRegion]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    const previousOverlays = roomOverlaysRef.current;
    let nextOverlays: KakaoCustomOverlayInstance[] = [];

    if (!ready || !map || !maps || displayMode !== "room") {
      roomOverlaysRef.current = nextOverlays;
      previousOverlays.forEach((overlay) => overlay.setMap(null));
      return;
    }

    const detailRegion = focusedRegion ?? selectedRegion;

    const roomClusters = clusterRooms(
      rooms
      .filter((room) => getDistrictName(room.regionLabel) === detailRegion)
      .filter((room) => room.latitude !== null && room.longitude !== null),
      getClusterDistanceMeters(zoomLevel),
    );

    nextOverlays = roomClusters.map((cluster) => {
      const position = new maps.LatLng(cluster.latitude, cluster.longitude);
      const content = document.createElement("button");
      content.type = "button";
      const isCluster = cluster.rooms.length > 1;

      if (isCluster) {
        content.className = "room-cluster-marker";
        content.setAttribute("aria-label", `근처 채팅방 ${cluster.rooms.length}개`);
        content.textContent = String(cluster.rooms.length);
        content.addEventListener("click", () => {
          onRoomClusterSelect(cluster.rooms.map((room) => room.id));
        });
      } else {
        const room = cluster.rooms[0];
        const participantDigits = Math.min(String(room.memberCount).length, 4);
        content.className = `room-map-marker participants-${participantDigits}-digits`;
        content.setAttribute("aria-label", `${room.title}, 참여자 ${room.memberCount}명`);

        const count = document.createElement("strong");
        count.className = "room-marker-participants";
        const personIcon = document.createElement("i");
        personIcon.setAttribute("aria-hidden", "true");
        const countText = document.createElement("span");
        countText.textContent = String(room.memberCount);
        count.append(personIcon, countText);
        const label = document.createElement("span");
        label.className = "room-marker-label";
        label.textContent = room.title ?? "1:1 대화";
        content.append(count, label);
        content.addEventListener("click", () => onRoomSelect(room.id));
      }

      return new maps.CustomOverlay({
        map,
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 5,
    });
      });

    roomOverlaysRef.current = nextOverlays;
    previousOverlays.forEach((overlay) => overlay.setMap(null));
  }, [displayMode, focusedRegion, onRoomClusterSelect, onRoomSelect, ready, rooms, selectedRegion, zoomLevel]);

  useEffect(() => {
    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      roomOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      currentLocationOverlayRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !map || !maps || !currentLocation) return;

    const position = new maps.LatLng(currentLocation.latitude, currentLocation.longitude);
    map.setLevel(3);
    map.setCenter(position);

    currentLocationOverlayRef.current?.setMap(null);
    const content = document.createElement("div");
    content.className = "current-location-marker";
    content.setAttribute("aria-label", "현재 위치");
    content.innerHTML = '<span class="current-location-dot" aria-hidden="true"></span>';

    currentLocationOverlayRef.current = new maps.CustomOverlay({
      map,
      position,
      content,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 9,
    });
  }, [currentLocation, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !map || !maps || !isSelectingLocation) return;

    const handleMapClick = (event: KakaoMapMouseEvent) => {
      onLocationSelect({
        latitude: event.latLng.getLat(),
        longitude: event.latLng.getLng(),
      });
    };

    maps.event.addListener(map, "click", handleMapClick);
    return () => maps.event.removeListener(map, "click", handleMapClick);
  }, [isSelectingLocation, onLocationSelect, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    selectedLocationOverlayRef.current?.setMap(null);
    selectedLocationOverlayRef.current = null;

    if (!ready || !map || !maps || !selectedLocation) return;

    const content = document.createElement("div");
    content.className = "selected-location-marker";
    content.innerHTML = "<i></i><span>선택한 위치</span>";
    selectedLocationOverlayRef.current = new maps.CustomOverlay({
      map,
      position: new maps.LatLng(selectedLocation.latitude, selectedLocation.longitude),
      content,
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 8,
    });

    return () => {
      selectedLocationOverlayRef.current?.setMap(null);
      selectedLocationOverlayRef.current = null;
    };
  }, [ready, selectedLocation]);

  return (
    <div className={`map-canvas ${isSelectingLocation ? "selecting-location" : ""}`}>
      <div ref={containerRef} className="kakao-map" aria-label="서울 지역 Kakao 지도" />

      <div className="map-zoom-controls" aria-label="지도 확대 및 축소">
        <button
          type="button"
          aria-label="지도 확대"
          disabled={!ready || zoomLevel <= MIN_ZOOM_LEVEL}
          onClick={() => changeZoom("in")}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="지도 축소"
          disabled={!ready || zoomLevel >= MAX_ZOOM_LEVEL}
          onClick={() => changeZoom("out")}
        >
          <Minus aria-hidden="true" />
        </button>
      </div>

      {!ready && !error && <div className="map-status">지도를 불러오는 중이에요.</div>}
      {error && (
        <div className="map-status map-error">
          <strong>지도를 표시할 수 없어요.</strong>
          <span>{error}</span>
          <small>Kakao Developers에서 localhost 도메인 등록을 확인해주세요.</small>
        </div>
      )}

      {isSelectingLocation && (
        <div className="location-picker-banner" role="status">
          <div>
            <strong>채팅방의 대략적인 위치를 선택해주세요</strong>
            <span>지도 위 원하는 지점을 클릭하면 다음 단계로 이동합니다.</span>
          </div>
          <button type="button" onClick={onLocationSelectCancel}>취소</button>
        </div>
      )}

    </div>
  );
}
