import { useState } from "react";
import { authApi } from "../api/authApi";

type NicknameSetupPageProps = {
  onCompleted: () => void;
  onLogout: () => void;
};

export function NicknameSetupPage({ onCompleted, onLogout }: NicknameSetupPageProps) {
  const [nickname, setNickname] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function changeNickname(nextNickname: string) {
    setNickname(nextNickname);
    setAvailable(null);
    setNotice("");
  }

  async function checkNickname() {
    setLoading(true);
    setNotice("");
    try {
      const result = await authApi.checkNickname(nickname);
      setAvailable(result.available);
    } catch {
      setAvailable(null);
      setNotice("닉네임 중복확인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function configureNickname() {
    setLoading(true);
    setNotice("");
    try {
      await authApi.configureNickname(nickname);
      onCompleted();
    } catch {
      setAvailable(null);
      setNotice("닉네임을 설정하지 못했어요. 중복 여부를 다시 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card nickname-setup-card" aria-labelledby="nickname-setup-title">
        <div className="auth-brand"><span>l</span> loop</div>
        <p className="auth-eyebrow">WELCOME TO LOOP</p>
        <h1 id="nickname-setup-title">사용할 닉네임을 정해주세요</h1>
        <p className="auth-description">동네 이웃에게 표시되는 이름이에요. 최대 12자까지 입력할 수 있어요.</p>

        <div className="nickname-setup-form">
          <label>
            닉네임
            <div className="input-action">
              <input
                value={nickname}
                maxLength={12}
                onChange={(event) => changeNickname(event.target.value)}
                placeholder="닉네임 입력"
              />
              <button type="button" onClick={checkNickname} disabled={loading || !nickname}>중복확인</button>
            </div>
          </label>

          {available !== null && (
            <p className={`nickname-check-result ${available ? "available" : "unavailable"}`} role="status">
              {available ? "사용 가능한 닉네임이에요." : "이미 사용 중인 닉네임이에요."}
            </p>
          )}
          {notice && <p className="auth-notice" role="status">{notice}</p>}

          <button className="auth-submit" type="button" onClick={configureNickname} disabled={loading || available !== true}>
            {loading ? "설정 중..." : "이 닉네임으로 시작하기"}
          </button>
          <button className="nickname-setup-logout" type="button" onClick={onLogout}>다른 계정으로 로그인</button>
        </div>
      </section>
    </main>
  );
}
