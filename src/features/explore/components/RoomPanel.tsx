import { rooms } from "../data/mockData";

type RoomPanelProps = {
  selectedRegion: string;
  selectedRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
};

export function RoomPanel({ selectedRegion, selectedRoomId, onRoomSelect }: RoomPanelProps) {
  return (
    <aside className="room-panel" aria-label={`${selectedRegion} 채팅방`}>
      <div className="room-list">
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
