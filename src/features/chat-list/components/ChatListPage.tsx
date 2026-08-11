"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Search, Users } from "lucide-react";
import { mockConversations } from "../data/mockConversations";

type ChatFilter = "전체" | "오픈채팅" | "1:1";

export function ChatListPage() {
  const [filter, setFilter] = useState<ChatFilter>("전체");
  const [selectedId, setSelectedId] = useState(1);

  const conversations = useMemo(() => {
    if (filter === "오픈채팅") return mockConversations.filter((item) => item.type === "OPEN");
    if (filter === "1:1") return mockConversations.filter((item) => item.type === "DIRECT");
    return mockConversations;
  }, [filter]);

  return (
    <section className="chat-list-page" aria-label="내 채팅 목록">
      <header className="chat-list-header">
        <div>
          <p className="eyebrow">MY CONVERSATIONS</p>
          <h1>내 채팅</h1>
          <span>참여 중인 동네 대화와 1:1 메시지를 확인하세요.</span>
        </div>
        <div className="chat-summary"><MessageCircle /><strong>읽지 않은 대화 6개</strong></div>
      </header>

      <div className="chat-list-toolbar">
        <div className="chat-search">
          <Search />
          <input aria-label="채팅 검색" placeholder="채팅방 또는 메시지 검색" />
        </div>
        <div className="chat-tabs" aria-label="채팅 유형">
          {(["전체", "오픈채팅", "1:1"] as ChatFilter[]).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div className="conversation-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={`conversation-row ${selectedId === conversation.id ? "active" : ""}`}
            onClick={() => setSelectedId(conversation.id)}
          >
            <div className="conversation-copy">
              <div className="conversation-title">
                <strong>{conversation.title}</strong>
                <time>{conversation.time}</time>
              </div>
              <div className="conversation-meta">
                <span className={conversation.type === "OPEN" ? "open" : "direct"}>{conversation.type === "OPEN" ? "오픈채팅" : "1:1"}</span>
                <small>{conversation.area}</small>
                {conversation.people && <small className="member-count"><Users /> {conversation.people}명</small>}
              </div>
              <div className="conversation-message">
                <p>{conversation.message}</p>
                {conversation.unread > 0 && <b>{conversation.unread}</b>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
