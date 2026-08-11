import { MessageCircle, X } from "lucide-react";

export type ChatProfile = {
  nickname: string;
  initial: string;
  area: string;
  introduction: string;
  activity: string;
  conversations: number;
};

type UserProfileModalProps = {
  profile: ChatProfile;
  onClose: () => void;
  onStartDirectChat: () => void;
};

export function UserProfileModal({ profile, onClose, onStartDirectChat }: UserProfileModalProps) {
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
        <dl>
          <div><dt>활동 기간</dt><dd>{profile.activity}</dd></div>
          <div><dt>함께한 대화</dt><dd>{profile.conversations}개</dd></div>
        </dl>
        <button className="user-profile-direct-button" type="button" onClick={onStartDirectChat}>
          <MessageCircle aria-hidden="true" />
          1:1 대화하기
        </button>
      </article>
    </div>
  );
}
