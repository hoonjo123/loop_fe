"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { Conversation } from "@/src/features/chat/api/chatApi";

type ChatFilter = "전체" | "오픈채팅" | "1:1";

type ChatListPageProps = {
  onConversationOpen: (conversation: Conversation) => void;
  conversations: Conversation[];
  loading: boolean;
  error: string;
};

export function ChatListPage({
  onConversationOpen,
  conversations,
  loading,
  error,
}: ChatListPageProps) {
  const [filter, setFilter] = useState<ChatFilter>("전체");
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => conversations.filter((item) => {
    const matchesType = filter === "전체"
      || (filter === "오픈채팅" && item.roomType === "OPEN")
      || (filter === "1:1" && item.roomType === "DIRECT");
    const keyword = query.trim().toLocaleLowerCase();
    const matchesQuery = !keyword
      || item.title.toLocaleLowerCase().includes(keyword)
      || item.lastMessage.toLocaleLowerCase().includes(keyword);
    return matchesType && matchesQuery;
  }), [conversations, filter, query]);

  return (
    <section className="chat-list-page" aria-label="내 채팅 목록">
      <header className="chat-list-header">
        <div>
          <p className="eyebrow">MY CONVERSATIONS</p>
          <h1>내 채팅</h1>
          <span>참여 중인 동네 대화와 1:1 메시지를 확인하세요.</span>
        </div>
      </header>

      <div className="chat-list-toolbar">
        <div className="chat-search">
          <Search />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="채팅 검색" placeholder="채팅방 또는 메시지 검색" />
        </div>
        <div className="chat-tabs" aria-label="채팅 유형">
          {(["전체", "오픈채팅", "1:1"] as ChatFilter[]).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div className="conversation-list">
        {loading && <p className="conversation-state">채팅 목록을 불러오는 중입니다.</p>}
        {error && <p className="conversation-state" role="alert">{error}</p>}
        {!loading && !error && filteredConversations.length === 0 && <p className="conversation-state">참여 중인 채팅이 없습니다.</p>}
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.roomId}
            className="conversation-row"
            onClick={() => onConversationOpen(conversation)}
          >
            <div className="conversation-copy">
              <div className="conversation-title">
                <strong>{conversation.title}</strong>
                <time>{formatRelativeTime(conversation.lastMessageAt)}</time>
              </div>
              <div className="conversation-meta">
                <span className={conversation.roomType === "OPEN" ? "open" : "direct"}>{conversation.roomType === "OPEN" ? "오픈채팅" : "1:1"}</span>
                <small>{conversation.regionLabel}</small>
                {conversation.roomType === "OPEN" && <small className="member-count"><Users /> {conversation.memberCount}명</small>}
              </div>
              <div className="conversation-message">
                <p>{conversation.lastMessage}</p>
                {conversation.unreadCount > 0 && <b>{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</b>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function formatRelativeTime(value: string | null) {
  if (!value) return "";
  const difference = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(difference / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간`;
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(value));
}
