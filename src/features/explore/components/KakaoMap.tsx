"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/src/config/env";
import type { KakaoCustomOverlayInstance, KakaoMapInstance, KakaoMapMouseEvent, KakaoMapsApi } from "@/src/shared/types/kakao-maps";
import { regions, rooms } from "../data/mockData";
import type { ApproximateLocation } from "../types";
import { loadKakaoMaps } from "../lib/loadKakaoMaps";

type KakaoMapProps = {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedLocation: ApproximateLocation | null;
  isSelectingLocation: boolean;
  onLocationSelect: (location: ApproximateLocation) => void;
  onLocationSelectCancel: () => void;
  onRoomSelect: (roomId: number) => void;
};

const roomOffsets = [
  { latitude: 0.012, longitude: -0.014 },
  { latitude: -0.009, longitude: 0.011 },
  { latitude: 0.004, longitude: 0.018 },
  { latitude: -0.015, longitude: -0.002 },
];

const CITY_LEVEL = 9;
const DISTRICT_LEVEL = 6;

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
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsApiRef = useRef<KakaoMapsApi | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlayInstance[]>([]);
  const roomOverlaysRef = useRef<KakaoCustomOverlayInstance[]>([]);
  const selectedLocationOverlayRef = useRef<KakaoCustomOverlayInstance | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>("district");
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
      const nextMode = getMapDisplayMode(map.getLevel());
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
    if (!ready || !map || !maps) return;

    const previousOverlays = overlaysRef.current;
    let nextOverlays: KakaoCustomOverlayInstance[] = [];

    if (displayMode === "city") {
      const totalCount = regions.reduce((sum, region) => sum + region.count, 0);
      const position = new maps.LatLng(37.5665, 126.978);
      const content = document.createElement("button");
      content.type = "button";
      content.className = "city-overlay";
      content.setAttribute("aria-label", `서울특별시, 채팅방 ${totalCount}개`);

      const count = document.createElement("strong");
      count.textContent = String(totalCount);
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

    nextOverlays = regions.map((region) => {
      const position = new maps.LatLng(region.latitude, region.longitude);
      const content = document.createElement("button");
      content.type = "button";
      content.className = `region-overlay ${selectedRegion === region.name ? "active" : ""}`;
      content.setAttribute("aria-label", `${region.name}, 채팅방 ${region.count}개`);

      if (region.hot) {
        const heat = document.createElement("span");
        heat.className = "heat";
        heat.textContent = "활발";
        content.appendChild(heat);
      }

      const count = document.createElement("strong");
      count.textContent = String(region.count);
      const name = document.createElement("small");
      name.textContent = region.name;
      content.append(count, name);

      content.addEventListener("click", () => {
        onRegionChange(region.name);
        setFocusedRegion(region.name);
        map.panTo(position);
        map.setLevel(5, { anchor: position, animate: true });
      });

      return new maps.CustomOverlay({
        map,
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: selectedRegion === region.name ? 4 : 3,
      });
    });

    overlaysRef.current = nextOverlays;
    previousOverlays.forEach((overlay) => overlay.setMap(null));
  }, [displayMode, onRegionChange, ready, selectedRegion]);

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
    const region = regions.find((item) => item.name === detailRegion);
    if (!region) return;

    nextOverlays = rooms.map((room, index) => {
      const offset = roomOffsets[index % roomOffsets.length];
      const position = new maps.LatLng(
        region.latitude + offset.latitude,
        region.longitude + offset.longitude,
      );
      const content = document.createElement("button");
      content.type = "button";
      content.className = "room-map-marker";
      content.setAttribute("aria-label", `${room.title}, 참여자 ${room.people}명`);

      const count = document.createElement("strong");
      count.textContent = String(room.people);
      const label = document.createElement("span");
      label.textContent = room.title;
      content.append(count, label);
      content.addEventListener("click", () => onRoomSelect(room.id));

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
  }, [displayMode, focusedRegion, onRoomSelect, ready, selectedRegion]);

  useEffect(() => {
    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      roomOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    };
  }, []);

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
    <div className="map-canvas">
      <div ref={containerRef} className="kakao-map" aria-label="서울 지역 Kakao 지도" />

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
