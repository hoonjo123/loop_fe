"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";
import type { ChatProfile } from "./UserProfileModal";

type DirectChatPageProps = {
  profile: ChatProfile;
  onBack: () => void;
};

type DirectMessage = {
  id: number;
  message: string;
  time: string;
  mine?: boolean;
};

export function DirectChatPage({ profile, onBack }: DirectChatPageProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([
    { id: 1, message: "안녕하세요! 1:1 대화로 인사드려요.", time: "방금" },
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;

    setMessages((current) => [...current, { id: Date.now(), message, time: "방금", mine: true }]);
    setDraft("");
  };

  return (
    <section className="chat-room-page direct-chat-page" aria-label={`${profile.nickname}님과의 1:1 대화`}>
      <div className="chat-room-main">
        <header className="chat-room-header">
          <button className="chat-back-button" onClick={onBack} aria-label="채팅방으로 돌아가기">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div className="direct-chat-heading">
            <span className="direct-chat-avatar" aria-hidden="true">{profile.initial}</span>
            <div>
              <h1>{profile.nickname}</h1>
              <span>1:1 대화</span>
            </div>
          </div>
        </header>

        <div className="chat-messages" aria-live="polite">
          <div className="chat-date-divider"><span>오늘</span></div>
          <p className="chat-system-message">{profile.nickname}님과 1:1 대화를 시작했어요.</p>
          {messages.map((item) => (
            <div className={`chat-message-row ${item.mine ? "mine" : ""}`} key={item.id}>
              {!item.mine && <span className="chat-author-avatar" aria-hidden="true">{profile.initial}</span>}
              <div className="chat-message-stack">
                {!item.mine && <strong className="chat-message-author-name">{profile.nickname}</strong>}
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

      <aside className="chat-room-info direct-chat-info" aria-label="대화 상대 정보">
        <div className="user-profile-avatar" aria-hidden="true">{profile.initial}</div>
        <h2>{profile.nickname}</h2>
        <p>{profile.introduction}</p>
        <span>서로를 배려하며 편안하게 대화해주세요.</span>
      </aside>
    </section>
  );
}
