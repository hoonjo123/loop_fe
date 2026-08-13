import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthPage } from "@/src/features/auth/components/AuthPage";
import { NicknameSetupPage } from "@/src/features/auth/components/NicknameSetupPage";
import { authApi, type AuthSession, type TokenPair } from "@/src/features/auth/api/authApi";
import { ExplorePage } from "@/src/features/explore/components/ExplorePage";
import "@/styles/index.css";

function App() {
  const [tokens, setTokens] = useState<TokenPair | null>(() => {
    const accessToken = sessionStorage.getItem("loop_access_token");
    const refreshToken = sessionStorage.getItem("loop_refresh_token");
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  });
  const [sessionChecked, setSessionChecked] = useState(Boolean(tokens));
  const [nicknameRequired, setNicknameRequired] = useState(false);
  const sessionRecoveryStarted = useRef(false);

  useEffect(() => {
    if (tokens || sessionRecoveryStarted.current) return;
    sessionRecoveryStarted.current = true;
    restoreSession()
      .finally(() => setSessionChecked(true));

    async function restoreSession() {
      let response = await authApi.session();
      if (!response.ok) {
        const refreshed = await authApi.refreshFromCookie();
        if (!refreshed.ok) return;
        response = await authApi.session();
      }
      if (!response.ok) return;

      const session = await response.json() as AuthSession;
      setNicknameRequired(!session.nicknameConfigured);
      setTokens({ accessToken: "cookie", refreshToken: "cookie" });
    }
  }, [tokens]);

  if (!sessionChecked) return null;

  if (!tokens) {
    return <AuthPage onAuthenticated={(nextTokens) => {
      sessionStorage.setItem("loop_access_token", nextTokens.accessToken);
      sessionStorage.setItem("loop_refresh_token", nextTokens.refreshToken);
      setNicknameRequired(false);
      setTokens(nextTokens);
    }} />;
  }

  async function handleLogout() {
    try {
      await authApi.logout();
      sessionStorage.removeItem("loop_access_token");
      sessionStorage.removeItem("loop_refresh_token");
      setNicknameRequired(false);
      setTokens(null);
    } catch {
      window.alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  if (nicknameRequired) {
    return <NicknameSetupPage onCompleted={() => setNicknameRequired(false)} onLogout={handleLogout} />;
  }

  return <ExplorePage onLogout={handleLogout} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
