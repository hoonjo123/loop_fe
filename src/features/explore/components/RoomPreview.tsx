import type { Room } from "../types";

type RoomPreviewProps = {
  room: Room;
  onClose: () => void;
  onJoin: () => void;
};

export function RoomPreview({ room, onClose, onJoin }: RoomPreviewProps) {
  return (
    <div className="room-preview" role="dialog" aria-modal="true" aria-label="채팅방 미리보기">
      <button className="preview-backdrop" onClick={onClose} aria-label="닫기" />
      <article>
        <button className="preview-close" onClick={onClose} aria-label="닫기">×</button>
        <div className="preview-body">
          <div className="room-meta">
            <span className={room.type === "임시" ? "temporary" : "permanent"}>{room.type}</span>
            <small>{room.area}</small>
            <small className="room-participants">총 {room.people}명 참여 중</small>
          </div>
          <h2>{room.title}</h2>
          <p>{room.message}</p>
          <button className="join-button" onClick={onJoin}>대화에 참여하기</button>
          <small className="safety-copy">정확한 위치는 다른 사용자에게 공개되지 않아요.</small>
        </div>
      </article>
    </div>
  );
}
