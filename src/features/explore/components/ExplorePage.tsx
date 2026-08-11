"use client";

import { useCallback, useMemo, useState } from "react";
import { ChatListPage } from "@/src/features/chat-list/components/ChatListPage";
import { ChatRoomPage } from "@/src/features/chat-room/components/ChatRoomPage";
import { ProfilePage } from "@/src/features/profile/components/ProfilePage";
import { rooms } from "../data/mockData";
import type { ApproximateLocation } from "../types";
import { AppHeader } from "./AppHeader";
import { CreateRoomModal } from "./CreateRoomModal";
import { DesktopNavigation, MobileNavigation, type AppView } from "./Navigation";
import { RegionMap } from "./RegionMap";
import { RoomPanel } from "./RoomPanel";
import { RoomPreview } from "./RoomPreview";

export function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState("마포구");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<number | null>(null);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ApproximateLocation | null>(null);
  const [activeView, setActiveView] = useState<AppView>("explore");

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [selectedRoomId],
  );
  const joinedRoom = useMemo(
    () => rooms.find((room) => room.id === joinedRoomId),
    [joinedRoomId],
  );

  const startCreateRoom = useCallback(() => {
    setActiveView("explore");
    setSelectedRoomId(null);
    setCreateRoomOpen(false);
    setSelectedLocation(null);
    setIsSelectingLocation(true);
  }, []);

  const handleLocationSelect = useCallback((location: ApproximateLocation) => {
    setSelectedLocation(location);
    setIsSelectingLocation(false);
    setCreateRoomOpen(true);
  }, []);

  const cancelLocationSelect = useCallback(() => {
    setIsSelectingLocation(false);
    setSelectedLocation(null);
  }, []);

  const closeCreateRoom = useCallback(() => {
    setCreateRoomOpen(false);
    setSelectedLocation(null);
  }, []);

  return (
    <main className="app-shell">
      <AppHeader onProfileClick={() => setActiveView("profile")} />

      <section className="workspace">
        <DesktopNavigation activeView={activeView} onNavigate={setActiveView} onCreateRoom={startCreateRoom} />
        {activeView === "explore" ? (
          <>
            <RegionMap
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              selectedLocation={selectedLocation}
              isSelectingLocation={isSelectingLocation}
              onLocationSelect={handleLocationSelect}
              onLocationSelectCancel={cancelLocationSelect}
              onRoomSelect={setSelectedRoomId}
            />
            <RoomPanel
              selectedRegion={selectedRegion}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
            />
          </>
        ) : activeView === "chats" ? (
          <ChatListPage />
        ) : activeView === "profile" ? (
          <ProfilePage />
        ) : joinedRoom ? (
          <ChatRoomPage key={joinedRoom.id} room={joinedRoom} onBack={() => setActiveView("explore")} />
        ) : (
          <ChatListPage />
        )}
      </section>

      {activeView === "explore" && (
        <button className={`create-button ${isSelectingLocation ? "selecting" : ""}`} onClick={startCreateRoom}>
          <span>＋</span> 채팅방 만들기
        </button>
      )}

      <MobileNavigation activeView={activeView} onNavigate={setActiveView} onCreateRoom={startCreateRoom} />

      {selectedRoom && (
        <RoomPreview
          room={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
          onJoin={() => {
            setJoinedRoomId(selectedRoom.id);
            setSelectedRoomId(null);
            setActiveView("room");
          }}
        />
      )}

      {createRoomOpen && selectedLocation && (
        <CreateRoomModal region={selectedRegion} location={selectedLocation} onClose={closeCreateRoom} />
      )}
    </main>
  );
}
