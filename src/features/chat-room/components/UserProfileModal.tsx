import { Ban, Flag, MessageCircle, UserPlus, X } from "lucide-react";

export type ChatProfile = {
  userId: number;
  nickname: string;
  initial: string;
  area: string;
  introduction: string;
};

type UserProfileModalProps = {
  profile: ChatProfile;
  onClose: () => void;
  onStartDirectChat: () => void;
  onBlock?: () => void;
  onAddFriend?: () => void;
  onReport?: () => void;
};

export function UserProfileModal({ profile, onClose, onStartDirectChat, onBlock, onAddFriend, onReport }: UserProfileModalProps) {
  return (
    <div className="user-profile-modal" role="dialog" aria-modal="true" aria-labelledby="user-profile-name">
      <button className="user-profile-backdrop" onClick={onClose} aria-label="사용자 정보 닫기" />
      <article>
        <button className="user-profile-close" onClick={onClose} aria-label="닫기">
          <X aria-hidden="true" />
        </button>
        <div className="user-profile-avatar" aria-hidden="true">{profile.initial}</div>
        <h2 id="user-profile-name">{profile.nickname}</h2>
        <span className="user-profile-area">{profile.area}에서 활동 중</span>
        <p>{profile.introduction}</p>
        <button className="user-profile-direct-button" type="button" onClick={onStartDirectChat}>
          <MessageCircle aria-hidden="true" />
          1:1 대화하기
        </button>
        <div className="user-profile-safety-actions">
          {onAddFriend && <button type="button" onClick={onAddFriend}><UserPlus /> 친구 추가</button>}
          {onReport && <button type="button" onClick={onReport}><Flag /> 신고</button>}
          {onBlock && <button type="button" onClick={onBlock}><Ban /> 차단</button>}
        </div>
      </article>
    </div>
  );
}
