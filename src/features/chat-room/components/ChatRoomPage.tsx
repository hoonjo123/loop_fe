"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Flag, ImagePlus, LogOut, Search, Send, Trash2, UserMinus, Users, X } from "lucide-react";
import { chatApi, ChatSocket, type ChatMember, type ChatMessage, type ChatRoom } from "@/src/features/chat/api/chatApi";
import { UserProfileModal, type ChatProfile } from "./UserProfileModal";
import { ReportModal } from "./ReportModal";

type ReportTarget =
  | { type: "room"; id: number; label: string }
  | { type: "message"; id: number; label: string }
  | { type: "user"; id: number; label: string };

type ChatRoomPageProps = {
  room: ChatRoom;
  currentUserId: number;
  onBack: () => void;
  onRoomChange: (room: ChatRoom) => void;
};

export function ChatRoomPage({ room, currentUserId, onBack, onRoomChange }: ChatRoomPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ChatProfile | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const socketRef = useRef<ChatSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      chatApi.getMessages(room.id),
      chatApi.getMembers(room.id),
      chatApi.markRead(room.id),
    ])
      .then(([page, roomMembers]) => {
        if (!active) return;
        setMessages(page.messages);
        setNextCursor(page.nextCursor);
        setHasNext(page.hasNext);
        setMembers(roomMembers);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "채팅방을 불러오지 못했습니다.");
      });

    const socket = new ChatSocket();
    socketRef.current = socket;
    socket.connect(
      room.id,
      (message) => {
        shouldAutoScrollRef.current = true;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        void chatApi.markRead(room.id);
      },
      setError,
    );
    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room.id]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      shouldAutoScrollRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const owner = members.find((member) => member.role === "OWNER");
  const me = members.find((member) => member.userId === currentUserId);
  const directTarget = room.roomType === "DIRECT"
    ? members.find((member) => member.userId !== currentUserId)
    : null;
  const roomTitle = directTarget?.nickname ?? room.title ?? "1:1 대화";
  const displayedMessages = searchResults ?? messages;
  const memberProfiles = useMemo(
    () => new Map(members.map((member) => [member.userId, toProfile(member)])),
    [members],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    try {
      socketRef.current?.send(room.id, content);
      setDraft("");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "메시지를 보내지 못했습니다.");
    }
  }

  async function loadOlderMessages() {
    if (!nextCursor) return;
    const page = await chatApi.getMessages(room.id, nextCursor);
    shouldAutoScrollRef.current = false;
    setMessages((current) => [...page.messages, ...current]);
    setNextCursor(page.nextCursor);
    setHasNext(page.hasNext);
  }

  async function searchMessages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchResults(await chatApi.searchMessages(room.id, searchQuery));
  }

  async function deleteMessage(messageId: number) {
    const deleted = await chatApi.deleteMessage(room.id, messageId);
    setMessages((current) => current.map((message) => message.id === messageId ? deleted : message));
  }

  async function leaveRoom() {
    await chatApi.leaveRoom(room.id);
    onBack();
  }

  async function closeRoom() {
    if (!window.confirm("채팅방을 종료하시겠습니까? 종료 후에는 다시 대화할 수 없습니다.")) return;
    await chatApi.closeRoom(room.id);
    onBack();
  }

  async function kickMember(userId: number) {
    await chatApi.kickMember(room.id, userId);
    setMembers((current) => current.filter((member) => member.userId !== userId));
  }

  async function startDirectChat(targetUserId: number) {
    const directRoom = await chatApi.createDirectRoom(targetUserId);
    setSelectedProfile(null);
    onRoomChange(directRoom);
  }

  return (
    <section className="chat-room-page" aria-label={`${roomTitle} 채팅방`}>
      <div className="chat-room-main">
        <header className="chat-room-header">
          <button className="chat-back-button" onClick={onBack} aria-label="이전 화면으로 돌아가기">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div>
            <h1>{roomTitle}</h1>
            <span>{room.roomType === "DIRECT" ? "1:1 대화" : `${room.regionLabel} · ${members.length || room.memberCount}명 참여 중`}</span>
          </div>
          <button className="chat-header-action" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="메시지 검색">
            <Search aria-hidden="true" />
          </button>
          {me?.role === "OWNER" ? (
            <button className="chat-header-action leave" type="button" onClick={() => void closeRoom()} aria-label="채팅방 종료">
              <X aria-hidden="true" />
            </button>
          ) : (
            <button className="chat-header-action leave" type="button" onClick={() => void leaveRoom()} aria-label="채팅방 나가기">
              <LogOut aria-hidden="true" />
            </button>
          )}
        </header>

        {searchOpen && (
          <form className="chat-message-search" onSubmit={searchMessages}>
            <Search aria-hidden="true" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="이 방의 메시지 검색" aria-label="검색어" />
            <button type="submit">검색</button>
            <button type="button" onClick={() => { setSearchOpen(false); setSearchResults(null); setSearchQuery(""); }} aria-label="검색 닫기"><X /></button>
          </form>
        )}

        <div className="chat-messages" aria-live="polite">
          {hasNext && !searchResults && <button className="chat-load-more" type="button" onClick={() => void loadOlderMessages()}>이전 메시지 불러오기</button>}
          {searchResults && <p className="chat-search-summary">검색 결과 {searchResults.length}건</p>}
          {displayedMessages.length === 0 && <p className="chat-system-message">첫 메시지를 보내 대화를 시작해보세요.</p>}
          {displayedMessages.map((item) => {
            const mine = item.senderId === currentUserId;
            const profile = item.senderId ? memberProfiles.get(item.senderId) : undefined;
            if (item.messageType === "SYSTEM") {
              return <p className="chat-system-message" key={item.id}>{item.content}</p>;
            }
            return (
              <div className={`chat-message-row ${mine ? "mine" : ""}`} key={item.id}>
                {!mine && profile && (
                  <button className="chat-author-avatar" onClick={() => setSelectedProfile(profile)} aria-label={`${profile.nickname} 프로필 보기`}>
                    {profile.initial}
                  </button>
                )}
                <div className="chat-message-stack">
                  {!mine && <strong className="chat-message-author-name">{item.senderNickname}</strong>}
                  <div className="chat-message-content">
                    {item.deleted
                      ? <p className="deleted">삭제된 메시지입니다.</p>
                      : item.messageType === "IMAGE"
                        ? <img className="chat-message-image" src={item.imageUrl ?? ""} alt="채팅 이미지" />
                        : <p>{item.content}</p>}
                    <time>{formatMessageTime(item.createdAt)}</time>
                    {mine && !item.deleted && (
                      <button className="chat-message-delete" type="button" onClick={() => void deleteMessage(item.id)} aria-label="메시지 삭제">
                        <Trash2 aria-hidden="true" />
                      </button>
                    )}
                    {!mine && !item.deleted && (
                      <button className="chat-message-delete" type="button" onClick={() => setReportTarget({ type: "message", id: item.id, label: "메시지" })} aria-label="메시지 신고">
                        <Flag aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!searchResults && <div ref={messagesEndRef} className="chat-messages-end" aria-hidden="true" />}
        </div>

        {error && <p className="chat-error" role="alert">{error}</p>}
        <form className="chat-composer" onSubmit={handleSubmit}>
          <button type="button" aria-label="이미지 첨부 준비 중" disabled title="이미지 업로드는 준비 중입니다."><ImagePlus aria-hidden="true" /></button>
          <input value={draft} maxLength={2000} onChange={(event) => setDraft(event.target.value)} aria-label="메시지 입력" placeholder="메시지를 입력하세요" />
          <button className="chat-send-button" type="submit" aria-label="메시지 보내기"><Send aria-hidden="true" /></button>
        </form>
      </div>

      <aside className="chat-room-info" aria-label="채팅방 정보">
        <div className="chat-room-info-header">
          <span className={room.roomType === "DIRECT" ? "direct" : "open"}>
            {room.roomType === "DIRECT" ? "1:1" : "그룹"}
          </span>
          <h2>{roomTitle}</h2>
          <p>{room.description || "서로를 배려하며 편안하게 대화해주세요."}</p>
          {room.roomType === "OPEN" && (
            <button className="chat-room-report" type="button" onClick={() => setReportTarget({ type: "room", id: room.id, label: "채팅방" })}>
              <Flag /> 채팅방 신고
            </button>
          )}
        </div>
        {room.roomType === "OPEN" && (
          <div className="chat-room-location">
            <strong>대략적인 위치</strong>
            <span>{room.regionLabel} 주변</span>
            <small>정확한 위치는 공개되지 않아요.</small>
          </div>
        )}
        <div className="chat-participants">
          <div><strong>참여자</strong><span><Users /> {members.length}명</span></div>
          <ul>
            {members.map((member) => (
              <li key={member.userId}>
                <button type="button" className="participant-profile" onClick={() => setSelectedProfile(toProfile(member))}>
                  <span>{member.nickname.slice(0, 1)}</span>
                  <div><strong>{member.nickname}</strong><small>{member.userId === currentUserId ? "나" : member.role === "OWNER" ? "방장" : "참여 중"}</small></div>
                </button>
                {me?.role === "OWNER" && member.userId !== currentUserId && (
                  <button className="participant-kick" type="button" onClick={() => void kickMember(member.userId)} aria-label={`${member.nickname} 강퇴`}><UserMinus /></button>
                )}
              </li>
            ))}
          </ul>
          {owner && <small className="chat-owner-copy">방장: {owner.nickname}</small>}
        </div>
      </aside>

      {selectedProfile && selectedProfile.userId !== currentUserId && (
        <UserProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onStartDirectChat={() => void startDirectChat(selectedProfile.userId)}
          onBlock={() => {
            if (window.confirm(`${selectedProfile.nickname}님을 차단하시겠습니까?`)) {
              void chatApi.blockUser(selectedProfile.userId).then(() => setSelectedProfile(null));
            }
          }}
          onReport={() => {
            setReportTarget({ type: "user", id: selectedProfile.userId, label: `${selectedProfile.nickname} 사용자` });
            setSelectedProfile(null);
          }}
        />
      )}

      {reportTarget && (
        <ReportModal
          targetLabel={reportTarget.label}
          onClose={() => setReportTarget(null)}
          onSubmit={(reason, description) => chatApi.report({
            reportedUserId: reportTarget.type === "user" ? reportTarget.id : undefined,
            reportedRoomId: reportTarget.type === "room" ? reportTarget.id : undefined,
            reportedMessageId: reportTarget.type === "message" ? reportTarget.id : undefined,
            reason,
            description,
          }).then(() => undefined)}
        />
      )}
    </section>
  );
}

function toProfile(member: ChatMember): ChatProfile {
  return {
    userId: member.userId,
    nickname: member.nickname,
    initial: member.nickname.slice(0, 1),
    area: member.activityArea ?? "활동 지역 미설정",
    introduction: member.introduction ?? "등록된 자기소개가 없습니다.",
  };
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
