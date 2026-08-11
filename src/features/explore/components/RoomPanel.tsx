import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { rooms } from "../data/mockData";

type RoomPanelProps = {
  selectedRegion: string;
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
};

export function RoomPanel({ selectedRegion, selectedRoomId, onRoomSelect }: RoomPanelProps) {
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
        {isExpanded ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
        <span>{isExpanded ? "채팅 목록 접기" : "주변 채팅 보기"}</span>
      </button>

      <div className="room-list" id="mobile-room-list">
        {rooms.map((room) => (
          <button
            className={`room-card ${selectedRoomId === room.id ? "active" : ""}`}
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="room-copy">
              <div className="room-meta">
                <span className={room.type === "임시" ? "temporary" : "permanent"}>{room.type}</span>
                <small>{room.area}</small>
              </div>
              <h3>{room.title}</h3>
              <p>{room.message}</p>
              <div className="room-bottom">
                <span>● {room.people}명</span>
                <time>{room.time}</time>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button className="more-button">채팅방 더 보기</button>
    </aside>
  );
}
