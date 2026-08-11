import { useState, type FormEvent } from "react";
import { MapPin, MessageCircle, Pencil, Users, X } from "lucide-react";

type Profile = {
  nickname: string;
  area: string;
  introduction: string;
};

const initialProfile: Profile = {
  nickname: "민들레",
  area: "마포구",
  introduction: "가까운 동네 사람들과 편하게 이야기 나누는 것을 좋아해요.",
};

export function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editOpen, setEditOpen] = useState(false);

  const openEditor = () => {
    setDraft(profile);
    setEditOpen(true);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfile(draft);
    setEditOpen(false);
  };

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <header className="profile-page-header">
        <p className="eyebrow">MY PROFILE</p>
        <h1 id="profile-title">나의 프로필</h1>
        <span>동네에서 사용하는 내 정보와 활동을 확인하세요.</span>
      </header>

      <article className="my-profile-card">
        <button className="profile-edit-button" type="button" onClick={openEditor} aria-label="프로필 수정">
          <Pencil aria-hidden="true" />
        </button>

        <div className="my-profile-avatar" aria-hidden="true">{profile.nickname.slice(0, 1)}</div>
        <div className="my-profile-identity">
          <h2>{profile.nickname}</h2>
          <p><MapPin aria-hidden="true" /> {profile.area}에서 활동 중</p>
        </div>

        <p className="my-profile-introduction">
          {profile.introduction}
        </p>

        <dl className="my-profile-stats">
          <div>
            <dt><MessageCircle aria-hidden="true" /> 참여 중인 대화</dt>
            <dd>3개</dd>
          </div>
          <div>
            <dt><Users aria-hidden="true" /> 함께한 대화</dt>
            <dd>24개</dd>
          </div>
          <div>
            <dt>활동 기간</dt>
            <dd>8개월</dd>
          </div>
        </dl>
      </article>

      {editOpen && (
        <div className="profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
          <button className="profile-edit-backdrop" type="button" onClick={() => setEditOpen(false)} aria-label="프로필 수정 닫기" />
          <form onSubmit={saveProfile}>
            <button className="profile-edit-close" type="button" onClick={() => setEditOpen(false)} aria-label="닫기">
              <X aria-hidden="true" />
            </button>
            <div className="profile-edit-heading">
              <span><Pencil aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">EDIT PROFILE</p>
                <h2 id="profile-edit-title">프로필 수정</h2>
              </div>
            </div>

            <label>
              <span>닉네임</span>
              <input value={draft.nickname} maxLength={12} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} required />
            </label>
            <label>
              <span>활동 동네</span>
              <input value={draft.area} maxLength={20} onChange={(event) => setDraft({ ...draft, area: event.target.value })} required />
            </label>
            <label>
              <span>자기소개</span>
              <textarea value={draft.introduction} maxLength={100} rows={4} onChange={(event) => setDraft({ ...draft, introduction: event.target.value })} required />
            </label>

            <button className="profile-save-button" type="submit">저장하기</button>
          </form>
        </div>
      )}
    </section>
  );
}
