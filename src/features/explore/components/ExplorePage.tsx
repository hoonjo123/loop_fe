"use client";

import { useCallback, useMemo, useState } from "react";
import { ChatListPage } from "@/src/features/chat-list/components/ChatListPage";
import type { Conversation } from "@/src/features/chat-list/types";
import { ChatRoomPage } from "@/src/features/chat-room/components/ChatRoomPage";
import { DirectChatPage } from "@/src/features/chat-room/components/DirectChatPage";
import type { ChatProfile } from "@/src/features/chat-room/components/UserProfileModal";
import { ProfilePage } from "@/src/features/profile/components/ProfilePage";
import { rooms } from "../data/mockData";
import type { ApproximateLocation, Room } from "../types";
import { AppHeader } from "./AppHeader";
import { CreateRoomModal } from "./CreateRoomModal";
import { LocationMethodModal } from "./LocationMethodModal";
import { DesktopNavigation, MobileNavigation, type AppView } from "./Navigation";
import { RegionMap } from "./RegionMap";
import { RoomPanel } from "./RoomPanel";
import { RoomPreview } from "./RoomPreview";
import { SuggestionModal } from "./SuggestionModal";

export function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState("마포구");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [openedRoom, setOpenedRoom] = useState<Room | null>(null);
  const [directChatProfile, setDirectChatProfile] = useState<ChatProfile | null>(null);
  const [roomBackView, setRoomBackView] = useState<AppView>("explore");
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [locationMethodOpen, setLocationMethodOpen] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"current" | "map">("map");
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ApproximateLocation | null>(null);
  const [activeView, setActiveView] = useState<AppView>("explore");
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [selectedRoomId],
  );
  const startCreateRoom = useCallback(() => {
    setActiveView("explore");
    setSelectedRoomId(null);
    setCreateRoomOpen(false);
    setSelectedLocation(null);
    setIsSelectingLocation(false);
    setLocationMethodOpen(true);
  }, []);

  const chooseCurrentLocation = useCallback((location: ApproximateLocation) => {
    setLocationMethod("current");
    setSelectedLocation(location);
    setLocationMethodOpen(false);
    setCreateRoomOpen(true);
  }, []);

  const chooseMapLocation = useCallback(() => {
    setLocationMethod("map");
    setLocationMethodOpen(false);
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
    setLocationMethodOpen(true);
  }, []);

  const closeCreateRoom = useCallback(() => {
    setCreateRoomOpen(false);
    setSelectedLocation(null);
  }, []);

  const openConversation = useCallback((conversation: Conversation) => {
    if (conversation.type === "DIRECT") {
      setDirectChatProfile({
        nickname: conversation.title,
        initial: conversation.title.slice(0, 1),
        area: "",
        introduction: "1:1 대화를 나누고 있는 동네 이웃이에요.",
        activity: "",
        conversations: 0,
      });
      setOpenedRoom(null);
      setActiveView("room");
      return;
    }

    const room = rooms.find((item) => item.title === conversation.title) ?? {
      id: 1000 + conversation.id,
      title: conversation.title,
      area: conversation.area,
      type: "영구" as const,
      people: conversation.people ?? 1,
      message: conversation.message,
      time: conversation.time,
    };

    setOpenedRoom(room);
    setDirectChatProfile(null);
    setRoomBackView("chats");
    setActiveView("room");
  }, []);

  return (
    <main className="app-shell">
      <AppHeader
        onProfileClick={() => setActiveView("profile")}
        onSuggestionClick={() => setSuggestionOpen(true)}
        onLogout={() => window.alert("로그아웃은 로그인 기능 연결 후 사용할 수 있습니다.")}
      />

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
          <ChatListPage onConversationOpen={openConversation} />
        ) : activeView === "profile" ? (
          <ProfilePage onOpenChats={() => setActiveView("chats")} />
        ) : directChatProfile ? (
          <DirectChatPage
            profile={directChatProfile}
            onBack={() => {
              setDirectChatProfile(null);
              setActiveView("chats");
            }}
          />
        ) : openedRoom ? (
          <ChatRoomPage key={openedRoom.id} room={openedRoom} onBack={() => setActiveView(roomBackView)} />
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
            setOpenedRoom(selectedRoom);
            setDirectChatProfile(null);
            setRoomBackView("explore");
            setSelectedRoomId(null);
            setActiveView("room");
          }}
        />
      )}

      {suggestionOpen && <SuggestionModal onClose={() => setSuggestionOpen(false)} />}

      {createRoomOpen && selectedLocation && (
        <CreateRoomModal
          locationLabel={locationMethod === "current" ? "현재 위치 주변" : `${selectedRegion} · 선택한 지점 주변`}
          location={selectedLocation}
          onClose={closeCreateRoom}
        />
      )}
    </main>
  );
}
