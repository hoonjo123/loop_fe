"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, Send, Users } from "lucide-react";
import type { Room } from "@/src/features/explore/types";
import { DirectChatPage } from "./DirectChatPage";
import { UserProfileModal, type ChatProfile } from "./UserProfileModal";

type ChatRoomPageProps = {
  room: Room;
  onBack: () => void;
};

type ChatMessage = {
  id: number;
  author?: string;
  profile?: ChatProfile;
  message: string;
  time?: string;
  mine?: boolean;
  system?: boolean;
};

const walkerProfile: ChatProfile = {
  nickname: "산책러",
  initial: "산",
  area: "망원동",
  introduction: "퇴근 후 동네를 천천히 걷는 걸 좋아해요.",
  activity: "8개월",
  conversations: 18,
};

const greenPathProfile: ChatProfile = {
  nickname: "초록길",
  initial: "초",
  area: "망원동",
  introduction: "가까운 이웃과 편안한 이야기를 나누고 싶어요.",
  activity: "5개월",
  conversations: 11,
};

const initialMessages: ChatMessage[] = [
  { id: 1, message: "채팅방에 참여했어요. 동네 이웃에게 가볍게 인사해보세요.", system: true },
  { id: 2, author: "산책러", profile: walkerProfile, message: "안녕하세요! 저는 망원역 쪽에서 출발하려고 해요.", time: "오후 7:42" },
  { id: 3, author: "초록길", profile: greenPathProfile, message: "반가워요. 천천히 한 시간 정도 걸으면 좋겠네요 🙂", time: "오후 7:44" },
  { id: 4, message: "저도 좋아요! 출발 전에 여기서 다시 이야기해요.", time: "오후 7:45", mine: true },
];

export function ChatRoomPage({ room, onBack }: ChatRoomPageProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ChatProfile | null>(null);
  const [directChatProfile, setDirectChatProfile] = useState<ChatProfile | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), message, time: "방금", mine: true },
    ]);
    setDraft("");
  }

  if (directChatProfile) {
    return <DirectChatPage profile={directChatProfile} onBack={() => setDirectChatProfile(null)} />;
  }

  return (
    <section className="chat-room-page" aria-label={`${room.title} 채팅방`}>
      <div className="chat-room-main">
        <header className="chat-room-header">
          <button className="chat-back-button" onClick={onBack} aria-label="지도로 돌아가기">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div>
            <h1>{room.title}</h1>
            <span>{room.area} · {room.people}명 참여 중</span>
          </div>
        </header>

        <div className="chat-messages" aria-live="polite">
          <div className="chat-date-divider"><span>오늘</span></div>
          {messages.map((item) => item.system ? (
            <p className="chat-system-message" key={item.id}>{item.message}</p>
          ) : (
            <div className={`chat-message-row ${item.mine ? "mine" : ""}`} key={item.id}>
              {!item.mine && item.profile && (
                <button
                  className="chat-author-avatar"
                  onClick={() => setSelectedProfile(item.profile ?? null)}
                  aria-label={`${item.author} 프로필 보기`}
                >
                  {item.profile.initial}
                </button>
              )}
              <div className="chat-message-stack">
                {!item.mine && <strong className="chat-message-author-name">{item.author}</strong>}
                <div className="chat-message-content">
                  <p>{item.message}</p>
                  <time>{item.time}</time>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <button type="button" aria-label="이미지 첨부"><ImagePlus aria-hidden="true" /></button>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="메시지 입력"
            placeholder="메시지를 입력하세요"
          />
          <button className="chat-send-button" type="submit" aria-label="메시지 보내기">
            <Send aria-hidden="true" />
          </button>
        </form>
      </div>

      <aside className="chat-room-info" aria-label="채팅방 정보">
        <div className="chat-room-info-header">
          <span className={room.type === "임시" ? "temporary" : "permanent"}>{room.type}</span>
          <h2>{room.title}</h2>
          <p>{room.message}</p>
        </div>
        <div className="chat-room-location">
          <strong>대략적인 위치</strong>
          <span>{room.area} 주변</span>
          <small>정확한 위치는 공개되지 않아요.</small>
        </div>
        <div className="chat-participants">
          <div><strong>참여자</strong><span><Users /> {room.people}명</span></div>
          <ul>
            <li><span>민</span><div><strong>민들레</strong><small>나</small></div></li>
            <li><span>산</span><div><strong>산책러</strong><small>방장</small></div></li>
            <li><span>초</span><div><strong>초록길</strong><small>참여 중</small></div></li>
          </ul>
          <button type="button">참여자 전체 보기</button>
        </div>
      </aside>

      {selectedProfile && (
        <UserProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onStartDirectChat={() => {
            setDirectChatProfile(selectedProfile);
            setSelectedProfile(null);
          }}
        />
      )}
    </section>
  );
}
