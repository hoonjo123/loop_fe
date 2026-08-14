import { useState } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import type { ChatRoom } from "@/src/features/chat/api/chatApi";

type RoomPanelProps = {
  selectedRegion: string;
  selectedRoomId: number | null;
  rooms: ChatRoom[];
  loading: boolean;
  error: string;
  onRoomSelect: (roomId: number) => void;
  clusterRoomCount: number | null;
  onClusterClear: () => void;
};

export function RoomPanel({
  selectedRegion,
  selectedRoomId,
  rooms,
  loading,
  error,
  onRoomSelect,
  clusterRoomCount,
  onClusterClear,
}: RoomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPanelExpanded = clusterRoomCount !== null || isExpanded;

  return (
    <aside className={`room-panel ${isPanelExpanded ? "expanded" : "collapsed"}`} aria-label={`${selectedRegion} 채팅방`}>
      <button
        className="room-panel-toggle"
        type="button"
        aria-controls="mobile-room-list"
        aria-expanded={isPanelExpanded}
        aria-label={isPanelExpanded ? "채팅 목록 접기" : "채팅 목록 펼치기"}
        onClick={() => {
          if (clusterRoomCount !== null) {
            onClusterClear();
            setIsExpanded(false);
            return;
          }

          setIsExpanded((expanded) => !expanded);
        }}
      >
        {isPanelExpanded ? <ChevronsDown aria-hidden="true" /> : <ChevronsUp aria-hidden="true" />}
      </button>

      <div className="room-list" id="mobile-room-list">
        {clusterRoomCount !== null && (
          <div className="room-cluster-filter" role="status">
            <strong>선택한 위치의 채팅방 {clusterRoomCount}개</strong>
            <button type="button" onClick={onClusterClear}>전체보기</button>
          </div>
        )}
        {loading && <p className="room-list-state">채팅방을 불러오는 중이에요.</p>}
        {!loading && error && <p className="room-list-state error">{error}</p>}
        {!loading && !error && rooms.length === 0 && <p className="room-list-state">이 지역에는 아직 채팅방이 없어요.</p>}
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
