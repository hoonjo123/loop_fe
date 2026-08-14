"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatListPage } from "@/src/features/chat-list/components/ChatListPage";
import { chatApi, type ChatRoom, type Conversation } from "@/src/features/chat/api/chatApi";
import { ChatRoomPage } from "@/src/features/chat-room/components/ChatRoomPage";
import { ProfilePage } from "@/src/features/profile/components/ProfilePage";
import { profileApi, type UserProfile } from "@/src/features/profile/api/profileApi";
import type { ApproximateLocation } from "../types";
import { AppHeader } from "./AppHeader";
import { CreateRoomModal } from "./CreateRoomModal";
import { LocationMethodModal } from "./LocationMethodModal";
import { DesktopNavigation, MobileNavigation, type AppView } from "./Navigation";
import { RegionMap } from "./RegionMap";
import { RoomPanel } from "./RoomPanel";
import { RoomPreview } from "./RoomPreview";
import { SuggestionModal } from "./SuggestionModal";
import { getRegionFromLocation } from "../lib/getRegionFromLocation";
import { getDistrictName } from "../lib/getDistrictName";

type ExplorePageProps = {
  onLogout: () => void;
};

export function ExplorePage({ onLogout }: ExplorePageProps) {
  const [selectedRegion, setSelectedRegion] = useState("마포구");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [openedRoom, setOpenedRoom] = useState<ChatRoom | null>(null);
  const [roomBackView, setRoomBackView] = useState<AppView>("explore");
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [locationMethodOpen, setLocationMethodOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ApproximateLocation | null>(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [activeView, setActiveView] = useState<AppView>("explore");
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [selectedClusterRoomIds, setSelectedClusterRoomIds] = useState<number[] | null>(null);

  useEffect(() => {
    profileApi.getMine()
      .then(setProfile)
      .catch((error: unknown) => {
        setProfileError(error instanceof Error ? error.message : "프로필 정보를 불러오지 못했습니다.");
      });
  }, []);

  useEffect(() => {
    chatApi.getOpenRooms()
      .then((loadedRooms) => {
        setRooms(loadedRooms);
        setSelectedRegion((currentRegion) => {
          if (loadedRooms.length === 0) return currentRegion;

          const currentRegionHasRooms = loadedRooms.some(
            (room) => getDistrictName(room.regionLabel) === currentRegion,
          );
          return currentRegionHasRooms
            ? currentRegion
            : getDistrictName(loadedRooms[0]?.regionLabel ?? null);
        });
      })
      .catch((error: unknown) => {
        setRoomsError(error instanceof Error ? error.message : "채팅방을 불러오지 못했습니다.");
      })
      .finally(() => setRoomsLoading(false));
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId],
  );
  const selectedRegionRooms = useMemo(() => {
    const regionRooms = rooms.filter(
      (room) => getDistrictName(room.regionLabel) === selectedRegion,
    );

    if (selectedClusterRoomIds === null) return regionRooms;
    const selectedIds = new Set(selectedClusterRoomIds);
    return regionRooms.filter((room) => selectedIds.has(room.id));
  }, [rooms, selectedClusterRoomIds, selectedRegion]);

  const handleRegionChange = useCallback((region: string) => {
    setSelectedRegion(region);
    setSelectedClusterRoomIds(null);
  }, []);
  const startCreateRoom = useCallback(() => {
    setActiveView("explore");
    setSelectedRoomId(null);
    setCreateRoomOpen(false);
    setSelectedLocation(null);
    setSelectedLocationLabel("");
    setIsSelectingLocation(false);
    setLocationMethodOpen(true);
  }, []);

  const chooseCurrentLocation = useCallback(async (location: ApproximateLocation) => {
    const regionLabel = await getRegionFromLocation(location);
    setSelectedLocation(location);
    setSelectedLocationLabel(`${regionLabel} · 현재 위치 주변`);
    setLocationMethodOpen(false);
    setCreateRoomOpen(true);
  }, []);

  const chooseMapLocation = useCallback(() => {
    setLocationMethodOpen(false);
    setIsSelectingLocation(true);
  }, []);

  const handleLocationSelect = useCallback((location: ApproximateLocation) => {
    void getRegionFromLocation(location)
      .then((regionLabel) => {
        setSelectedLocation(location);
        setSelectedLocationLabel(`${regionLabel} · 선택한 지점 주변`);
        setIsSelectingLocation(false);
        setCreateRoomOpen(true);
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : "선택한 위치의 행정구역을 확인하지 못했습니다.");
      });
  }, []);

  const cancelLocationSelect = useCallback(() => {
    setIsSelectingLocation(false);
    setSelectedLocation(null);
    setSelectedLocationLabel("");
    setLocationMethodOpen(true);
  }, []);

  const closeCreateRoom = useCallback(() => {
    setCreateRoomOpen(false);
    setSelectedLocation(null);
    setSelectedLocationLabel("");
  }, []);

  const openConversation = useCallback(async (conversation: Conversation) => {
    const room = await chatApi.getRoom(conversation.roomId);
    setOpenedRoom(room);
    setRoomBackView("chats");
    setActiveView("room");
  }, []);

  return (
    <main className="app-shell">
      <AppHeader
        nickname={profile?.nickname ?? ""}
        profileImageUrl={profile?.profileImageUrl ?? null}
        onProfileClick={() => setActiveView("profile")}
        onSuggestionClick={() => setSuggestionOpen(true)}
        onLogout={onLogout}
      />

      <section className="workspace">
        <DesktopNavigation activeView={activeView} onNavigate={setActiveView} onCreateRoom={startCreateRoom} />
        {activeView === "explore" ? (
          <>
            <RegionMap
              selectedRegion={selectedRegion}
              onRegionChange={handleRegionChange}
              selectedLocation={selectedLocation}
              isSelectingLocation={isSelectingLocation}
              onLocationSelect={handleLocationSelect}
              onLocationSelectCancel={cancelLocationSelect}
              onRoomSelect={setSelectedRoomId}
              onRoomClusterSelect={(roomIds) => {
                setSelectedRoomId(null);
                setSelectedClusterRoomIds(roomIds);
              }}
              rooms={rooms}
            />
            <RoomPanel
              selectedRegion={selectedRegion}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
              rooms={selectedRegionRooms}
              loading={roomsLoading}
              error={roomsError}
              clusterRoomCount={selectedClusterRoomIds?.length ?? null}
              onClusterClear={() => setSelectedClusterRoomIds(null)}
            />
          </>
        ) : activeView === "chats" ? (
          <ChatListPage onConversationOpen={openConversation} />
        ) : activeView === "profile" ? (
          <ProfilePage
            profile={profile}
            loadError={profileError}
            onProfileChange={setProfile}
          />
        ) : openedRoom && profile ? (
          <ChatRoomPage
            key={openedRoom.id}
            room={openedRoom}
            currentUserId={profile.id}
            onBack={() => setActiveView(roomBackView)}
            onRoomChange={setOpenedRoom}
          />
        ) : (
          <ChatListPage onConversationOpen={openConversation} />
        )}
      </section>

      {activeView === "explore" && (
        <button className={`create-button ${isSelectingLocation ? "selecting" : ""}`} onClick={startCreateRoom}>
          <span>＋</span> 채팅방 만들기
        </button>
      )}

      <MobileNavigation activeView={activeView} onNavigate={setActiveView} onCreateRoom={startCreateRoom} />

      {locationMethodOpen && (
        <LocationMethodModal
          onClose={() => setLocationMethodOpen(false)}
          onChooseCurrentLocation={chooseCurrentLocation}
          onChooseMap={chooseMapLocation}
        />
      )}

      {selectedRoom && (
        <RoomPreview
          room={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
          onJoin={() => {
            void chatApi.joinRoom(selectedRoom.id).then((joinedRoom) => {
              setRooms((current) => current.map((room) => room.id === joinedRoom.id ? joinedRoom : room));
              setOpenedRoom(joinedRoom);
              setRoomBackView("explore");
              setSelectedRoomId(null);
              setActiveView("room");
            });
          }}
        />
      )}

      {suggestionOpen && <SuggestionModal onClose={() => setSuggestionOpen(false)} />}

      {createRoomOpen && selectedLocation && (
        <CreateRoomModal
          locationLabel={selectedLocationLabel}
          location={selectedLocation}
          onClose={closeCreateRoom}
          onCreated={(room) => {
            setRooms((current) => [room, ...current]);
            setSelectedRegion(getDistrictName(room.regionLabel));
            setSelectedClusterRoomIds(null);
            setCreateRoomOpen(false);
            setSelectedLocation(null);
            setSelectedLocationLabel("");
            setOpenedRoom(room);
            setRoomBackView("explore");
            setActiveView("room");
          }}
        />
      )}
    </main>
  );
}
