import { useState } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import type { ChatRoom } from "@/src/features/chat/api/chatApi";

type RoomPanelProps = {
  selectedRegion: string;
  selectedRoomId: number | null;
  rooms: ChatRoom[];
  loading: boolean;
  onRoomSelect: (roomId: number) => void;
};

export function RoomPanel({ selectedRegion, selectedRoomId, rooms, loading, onRoomSelect }: RoomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={`room-panel ${isExpanded ? "expanded" : "collapsed"}`} aria-label={`${selectedRegion} 채팅방`}>
      <button
        className="room-panel-toggle"
        type="button"
        aria-controls="mobile-room-list"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "채팅 목록 접기" : "채팅 목록 펼치기"}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? <ChevronsDown aria-hidden="true" /> : <ChevronsUp aria-hidden="true" />}
      </button>

      <div className="room-list" id="mobile-room-list">
        {loading && <p className="room-list-state">채팅방을 불러오는 중이에요.</p>}
        {!loading && rooms.length === 0 && <p className="room-list-state">이 지역에는 아직 채팅방이 없어요.</p>}
        {rooms.map((room) => (
          <button
            className={`room-card ${selectedRoomId === room.id ? "active" : ""}`}
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="room-copy">
              <div className="room-meta">
                <span className={room.durationType === "TEMPORARY" ? "temporary" : "permanent"}>
                  {room.durationType === "TEMPORARY" ? "임시" : "영구"}
                </span>
                <small>{room.regionLabel}</small>
              </div>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <div className="room-bottom">
                <span>● {room.memberCount}명</span>
                <time>{room.expiresAt ? `${new Date(room.expiresAt).toLocaleString("ko-KR")} 종료` : "계속되는 대화"}</time>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
