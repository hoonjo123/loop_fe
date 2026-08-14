import { CircleHelp, MapPinned, MessageCircle, Plus, UserRound } from "lucide-react";

export type AppView = "explore" | "chats" | "room" | "profile";

type NavigationProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onCreateRoom: () => void;
  unreadMessageCount: number;
};

export function DesktopNavigation({ activeView, onNavigate, unreadMessageCount }: NavigationProps) {
  return (
    <aside className="rail" aria-label="주요 메뉴">
      <button className={`rail-item ${activeView === "explore" ? "active" : ""}`} onClick={() => onNavigate("explore")}><span className="nav-icon"><MapPinned /></span><small>둘러보기</small></button>
      <button className={`rail-item ${activeView === "chats" || activeView === "room" ? "active" : ""}`} onClick={() => onNavigate("chats")}>
        <span className="nav-icon">
          <MessageCircle />
          <UnreadBadge count={unreadMessageCount} />
        </span>
        <small>내 채팅</small>
      </button>
      <div className="rail-spacer" />
      <button className="rail-item"><span className="nav-icon"><CircleHelp /></span><small>도움말</small></button>
    </aside>
  );
}

export function MobileNavigation({ activeView, onNavigate, onCreateRoom, unreadMessageCount }: NavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="모바일 메뉴">
      <button className={activeView === "explore" ? "active" : ""} onClick={() => onNavigate("explore")}><span className="nav-icon"><MapPinned /></span><small>둘러보기</small></button>
      <button className={activeView === "chats" || activeView === "room" ? "active" : ""} onClick={() => onNavigate("chats")}>
        <span className="nav-icon">
          <MessageCircle />
          <UnreadBadge count={unreadMessageCount} />
        </span>
        <small>내 채팅</small>
      </button>
      <button onClick={onCreateRoom}><span className="nav-icon"><Plus /></span><small>방 만들기</small></button>
      <button className={activeView === "profile" ? "active" : ""} onClick={() => onNavigate("profile")}><span className="nav-icon"><UserRound /></span><small>내 정보</small></button>
    </nav>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);
  return <span className="nav-unread-badge" aria-label={`읽지 않은 메시지 ${count}개`}>{label}</span>;
}
