import { FormEvent, useState } from "react";
import { authApi, type TokenPair } from "../api/authApi";

type AuthPageProps = {
  onAuthenticated: (tokens: TokenPair) => void;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    setNotice("");
    try {
      await authApi.sendVerificationCode(email);
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
      setNotice("이메일 인증이 완료됐어요.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "인증번호를 확인해주세요.");
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
      setNotice(error instanceof Error ? error.message : "로그인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand"><span>l</span> loop</div>
        <p className="auth-eyebrow">LOCAL COMMUNITY</p>
        <h1 id="auth-title">{mode === "login" ? "다시 만나서 반가워요" : "동네 대화를 시작해보세요"}</h1>
        <p className="auth-description">가까운 이웃과 편안하게 연결되는 공간이에요.</p>
        <form onSubmit={submit}>
          <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {mode === "signup" && <div className="verification-row"><button type="button" onClick={sendCode} disabled={loading || !email}>인증번호 받기</button><input aria-label="인증번호" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} placeholder="인증번호" /><button type="button" onClick={verifyCode} disabled={loading || code.length !== 6}>확인</button></div>}
          {mode === "signup" && <label>닉네임<input value={nickname} maxLength={12} onChange={(event) => setNickname(event.target.value)} required /></label>}
          <label>비밀번호<input type="password" value={password} minLength={8} onChange={(event) => setPassword(event.target.value)} required /></label>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" disabled={loading || (mode === "signup" && !verified)}>{loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}</button>
        </form>
        <div className="auth-divider"><span>또는</span></div>
        <a className="google-login" href={authApi.googleLoginUrl}>Google로 계속하기</a>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setNotice(""); }}>
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </section>
    </main>
  );
}
