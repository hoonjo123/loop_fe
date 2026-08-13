import { FormEvent, useEffect, useState } from "react";
import { authApi, type TokenPair } from "../api/authApi";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { AuthErrorModal } from "./AuthErrorModal";

type AuthPageProps = {
  onAuthenticated: (tokens: TokenPair) => void;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [verificationTtl, setVerificationTtl] = useState(0);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!codeSent) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [codeSent]);

  function changeEmail(nextEmail: string) {
    setEmail(nextEmail);
    setCode("");
    setCodeSent(false);
    setVerified(false);
    setCodeExpiresAt(0);
    setResendAvailableAt(0);
    setVerificationModalOpen(false);
  }

  function changeNickname(nextNickname: string) {
    setNickname(nextNickname);
    setNicknameAvailable(null);
  }

  function changeMode() {
    setMode(mode === "login" ? "signup" : "login");
    setVerificationModalOpen(false);
    setNotice("");
  }

  async function sendCode() {
    setLoading(true);
    setNotice("");
    try {
      const timing = await authApi.sendVerificationCode(email);
      setCodeSent(true);
      setVerified(false);
      setCode("");
      setVerificationTtl(timing.expiresInSeconds);
      setNow(Date.now());
      setCodeExpiresAt(Date.now() + timing.expiresInSeconds * 1000);
      setResendAvailableAt(Date.now() + timing.resendAfterSeconds * 1000);
      setNotice("인증번호를 이메일로 보냈어요.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "인증번호 발송에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setNotice("");
    try {
      await authApi.confirmVerificationCode(email, code);
      setVerified(true);
      setNow(Date.now());
      setCodeExpiresAt(Date.now() + verificationTtl * 1000);
      setNotice("이메일 인증이 완료됐어요.");
      setVerificationModalOpen(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "인증번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function checkNickname() {
    setLoading(true);
    setNotice("");
    try {
      const result = await authApi.checkNickname(nickname);
      setNicknameAvailable(result.available);
    } catch (error) {
      setNicknameAvailable(null);
      setNotice(error instanceof Error ? error.message : "닉네임 중복확인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const tokens = mode === "login"
        ? await authApi.login(email, password)
        : await authApi.signUp(email, password, nickname);
      onAuthenticated(tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그인에 실패했어요.";
      if (mode === "signup") {
        setErrorModalMessage(message);
      } else {
        setNotice(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const codeRemaining = secondsRemaining(codeExpiresAt, now);
  const resendRemaining = secondsRemaining(resendAvailableAt, now);
  const verificationActive = verified && codeRemaining > 0;
  const canSignUp = verificationActive && nicknameAvailable === true;
  const displayedNotice = codeSent && codeRemaining === 0
    ? "인증 유효시간이 만료됐어요. 인증번호를 다시 받아주세요."
    : notice;

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand"><span>l</span> loop</div>
        <p className="auth-eyebrow">LOCAL COMMUNITY</p>
        <h1 id="auth-title">{mode === "login" ? "다시 만나서 반가워요" : "동네 대화를 시작해보세요"}</h1>
        <p className="auth-description">가까운 이웃과 편안하게 연결되는 공간이에요.</p>

        <form onSubmit={submit}>
          <label>
            이메일
            <input type="email" value={email} onChange={(event) => changeEmail(event.target.value)} disabled={verificationActive} required />
          </label>

          {mode === "signup" && (
            <button
              className={`email-verification-trigger ${verificationActive ? "verified" : ""}`}
              type="button"
              onClick={() => setVerificationModalOpen(true)}
              disabled={!email || verificationActive}
            >
              {verificationActive ? "이메일 인증완료" : "이메일 인증하기"}
            </button>
          )}

          {mode === "signup" && (
            <label>
              닉네임
              <div className="input-action">
                <input value={nickname} maxLength={12} onChange={(event) => changeNickname(event.target.value)} required />
                <button type="button" onClick={checkNickname} disabled={loading || !nickname}>중복확인</button>
              </div>
              {nicknameAvailable !== null && (
                <small className={nicknameAvailable ? "available" : "unavailable"}>
                  {nicknameAvailable ? "사용 가능한 닉네임이에요." : "이미 사용 중인 닉네임이에요."}
                </small>
              )}
            </label>
          )}

          <label>
            비밀번호
            <input type="password" value={password} minLength={8} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {displayedNotice && <p className="auth-notice" role="status">{displayedNotice}</p>}
          <button className="auth-submit" disabled={loading || (mode === "signup" && !canSignUp)}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <div className="auth-divider"><span>또는</span></div>
        <a className="google-login" href={authApi.googleLoginUrl}>Google로 계속하기</a>
        <button className="auth-switch" type="button" onClick={changeMode}>
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </section>

      {mode === "signup" && verificationModalOpen && (
        <EmailVerificationModal
          email={email}
          code={code}
          codeSent={codeSent}
          codeRemaining={codeRemaining}
          resendRemaining={resendRemaining}
          loading={loading}
          notice={displayedNotice}
          onCodeChange={setCode}
          onSendCode={sendCode}
          onVerifyCode={verifyCode}
          onClose={() => setVerificationModalOpen(false)}
        />
      )}

      {errorModalMessage && (
        <AuthErrorModal message={errorModalMessage} onClose={() => setErrorModalMessage("")} />
      )}
    </main>
  );
}

function secondsRemaining(expiresAt: number, now: number) {
  if (!expiresAt) return 0;
  return Math.max(Math.ceil((expiresAt - now) / 1000), 0);
}
