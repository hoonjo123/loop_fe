import { env } from "@/src/config/env";

const apiBaseUrl = (env.apiBaseUrl || "http://localhost:8080/api").replace(/\/$/, "");
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, "");

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type ApiError = Error & { status?: number };

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = new Error("요청을 처리하지 못했어요. 입력값을 다시 확인해주세요.") as ApiError;
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const authApi = {
  sendVerificationCode: (email: string) => request<void>("/auth/email-verifications", { email }),
  confirmVerificationCode: (email: string, code: string) => request<void>("/auth/email-verifications/confirm", { email, code }),
  signUp: (email: string, password: string, nickname: string) => request<TokenPair>("/auth/sign-up", { email, password, nickname }),
  login: (email: string, password: string) => request<TokenPair>("/auth/login", { email, password }),
  logout: (refreshToken: string) => request<void>("/auth/logout", { refreshToken }),
  session: () => fetch(`${apiBaseUrl}/auth/session`, { credentials: "include" }),
  refreshFromCookie: () => fetch(`${apiBaseUrl}/auth/refresh/cookie`, {
    method: "POST",
    credentials: "include",
  }),
  googleLoginUrl: `${backendBaseUrl}/oauth2/authorization/google`,
};
