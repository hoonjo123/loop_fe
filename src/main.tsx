import { StrictMode, useEffect, useState } from "react";
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

  useEffect(() => {
    if (tokens) return;
    authApi.session()
      .then((response) => {
        if (response.ok) setTokens({ accessToken: "cookie", refreshToken: "cookie" });
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

  return <ExplorePage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
