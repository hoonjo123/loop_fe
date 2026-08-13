import { useState, type FormEvent } from "react";
import { CalendarDays, Mail, MapPin, Pencil, ShieldCheck, X } from "lucide-react";
import { profileApi, type ProfileUpdate, type UserProfile } from "@/src/features/profile/api/profileApi";

type ProfilePageProps = {
  profile: UserProfile | null;
  loadError: string;
  onProfileChange: (profile: UserProfile) => void;
};

const emptyDraft: ProfileUpdate = {
  nickname: "",
  profileImageUrl: null,
  introduction: null,
  activityArea: null,
};

export function ProfilePage({ profile, loadError, onProfileChange }: ProfilePageProps) {
  const [draft, setDraft] = useState<ProfileUpdate>(emptyDraft);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!profile) {
    return (
      <section className="profile-page" aria-labelledby="profile-title">
        <header className="profile-page-header">
          <p className="eyebrow">MY PROFILE</p>
          <h1 id="profile-title">나의 프로필</h1>
          <span>{loadError || "프로필 정보를 불러오는 중입니다."}</span>
        </header>
      </section>
    );
  }

  const openEditor = () => {
    setDraft({
      nickname: profile.nickname,
      profileImageUrl: profile.profileImageUrl,
      introduction: profile.introduction,
      activityArea: profile.activityArea,
    });
    setSaveError("");
    setEditOpen(true);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const updated = await profileApi.updateMine(draft);
      onProfileChange(updated);
      setEditOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "프로필을 수정하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const joinedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <header className="profile-page-header">
        <p className="eyebrow">MY PROFILE</p>
        <h1 id="profile-title">나의 프로필</h1>
        <span>동네에서 사용하는 내 정보를 확인하고 관리하세요.</span>
      </header>

      <article className="my-profile-card">
        <button className="profile-edit-button" type="button" onClick={openEditor} aria-label="프로필 수정">
          <Pencil aria-hidden="true" />
        </button>

        <div className="my-profile-avatar" aria-hidden="true">
          {profile.profileImageUrl
            ? <img src={profile.profileImageUrl} alt="" />
            : profile.nickname.slice(0, 1)}
        </div>
        <div className="my-profile-identity">
          <h2>{profile.nickname}</h2>
          <span>{profile.activityArea || "활동 지역 미설정"}</span>
        </div>

        <p className={`my-profile-introduction ${profile.introduction ? "" : "empty"}`}>
          {profile.introduction || "아직 등록된 자기소개가 없습니다."}
        </p>

        <dl className="my-profile-details">
          <div><dt><Mail aria-hidden="true" /> 이메일</dt><dd>{profile.email}</dd></div>
          <div><dt><MapPin aria-hidden="true" /> 활동 지역</dt><dd>{profile.activityArea || "미설정"}</dd></div>
          <div><dt><CalendarDays aria-hidden="true" /> 가입일</dt><dd>{joinedAt}</dd></div>
          <div><dt><ShieldCheck aria-hidden="true" /> 로그인 방식</dt><dd>{profile.authProvider === "GOOGLE" ? "Google" : "이메일"}</dd></div>
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
              <span>활동 지역</span>
              <input value={draft.activityArea ?? ""} maxLength={100} placeholder="예: 서울 마포구" onChange={(event) => setDraft({ ...draft, activityArea: event.target.value })} />
            </label>
            <label>
              <span>프로필 이미지 URL</span>
              <input type="url" value={draft.profileImageUrl ?? ""} maxLength={500} placeholder="https://" onChange={(event) => setDraft({ ...draft, profileImageUrl: event.target.value })} />
            </label>
            <label>
              <span>한 줄 소개</span>
              <textarea value={draft.introduction ?? ""} maxLength={100} rows={4} onChange={(event) => setDraft({ ...draft, introduction: event.target.value })} />
            </label>

            {saveError && <p className="profile-save-error" role="alert">{saveError}</p>}
            <button className="profile-save-button" type="submit" disabled={saving}>
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
