import type { ChatRoom } from "@/src/features/chat/api/chatApi";

type RoomPreviewProps = {
  room: ChatRoom;
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
            <span className={room.durationType === "TEMPORARY" ? "temporary" : "permanent"}>
              {room.durationType === "TEMPORARY" ? "임시" : "영구"}
            </span>
            <small>{room.regionLabel}</small>
            <small className="room-participants">총 {room.memberCount}명 참여 중</small>
          </div>
          <h2>{room.title}</h2>
          <p>{room.description}</p>
          <button className="join-button" onClick={onJoin}>{room.joined ? "대화방 열기" : "대화에 참여하기"}</button>
          <small className="safety-copy">정확한 위치는 다른 사용자에게 공개되지 않아요.</small>
        </div>
      </article>
    </div>
  );
}
