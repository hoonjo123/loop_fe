import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthPage } from "@/src/features/auth/components/AuthPage";
import { authApi, type TokenPair } from "@/src/features/auth/api/authApi";
import { ExplorePage } from "@/src/features/explore/components/ExplorePage";
import "@/styles/index.css";

function App() {
  const [tokens, setTokens] = useState<TokenPair | null>(() => {
    const accessToken = sessionStorage.getItem("loop_access_token");
    const refreshToken = sessionStorage.getItem("loop_refresh_token");
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  });
  const [sessionChecked, setSessionChecked] = useState(Boolean(tokens));
  const sessionRecoveryStarted = useRef(false);

  useEffect(() => {
    if (tokens || sessionRecoveryStarted.current) return;
    sessionRecoveryStarted.current = true;
    authApi.session()
      .then((response) => {
        if (response.ok) setTokens({ accessToken: "cookie", refreshToken: "cookie" });
        return response;
      })
      .then((response) => {
        if (response.ok) return null;
        return authApi.refreshFromCookie();
      })
      .then((response) => {
        if (response?.ok) setTokens({ accessToken: "cookie", refreshToken: "cookie" });
      })
      .finally(() => setSessionChecked(true));
  }, [tokens]);

  if (!sessionChecked) return null;

  if (!tokens) {
    return <AuthPage onAuthenticated={(nextTokens) => {
      sessionStorage.setItem("loop_access_token", nextTokens.accessToken);
      sessionStorage.setItem("loop_refresh_token", nextTokens.refreshToken);
      setTokens(nextTokens);
    }} />;
  }

  async function handleLogout() {
    try {
      await authApi.logout();
      sessionStorage.removeItem("loop_access_token");
      sessionStorage.removeItem("loop_refresh_token");
      setTokens(null);
    } catch {
      window.alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return <ExplorePage onLogout={handleLogout} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
