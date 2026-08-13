import { env } from "@/src/config/env";

const apiBaseUrl = (env.apiBaseUrl || "http://localhost:8080/api").replace(/\/$/, "");
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, "");

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type EmailVerificationTiming = {
  expiresInSeconds: number;
  resendAfterSeconds: number;
};

export type NicknameAvailability = {
  available: boolean;
};

export type AuthSession = {
  userId: number;
  nickname: string;
  nicknameConfigured: boolean;
};

type ErrorResponse = {
  code?: string;
  message?: string;
};

export type ApiError = Error & {
  status?: number;
  code?: string;
};

async function request<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!response.ok) {
    const errorBody = await readErrorResponse(response);
    const error = new Error(errorBody.message ?? "요청을 처리하지 못했어요. 입력값을 다시 확인해주세요.") as ApiError;
    error.status = response.status;
    error.code = errorBody.code;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function readErrorResponse(response: Response): Promise<ErrorResponse> {
  try {
    return await response.json() as ErrorResponse;
  } catch {
    return {};
  }
}

export const authApi = {
  sendVerificationCode: (email: string) => request<EmailVerificationTiming>("/auth/email-verifications", { email }),
  confirmVerificationCode: (email: string, code: string) => request<void>("/auth/email-verifications/confirm", { email, code }),
  signUp: (email: string, password: string, nickname: string) => request<TokenPair>("/auth/sign-up", { email, password, nickname }),
  checkNickname: (nickname: string) => request<NicknameAvailability>("/auth/nicknames/check", { nickname }),
  configureNickname: (nickname: string) => request<{ nickname: string; nicknameConfigured: boolean }>("/users/me/nickname", { nickname }, "PUT"),
  login: (email: string, password: string) => request<TokenPair>("/auth/login", { email, password }),
  logout: () => request<void>("/auth/logout"),
  session: () => fetch(`${apiBaseUrl}/auth/session`, { credentials: "include" }),
  refreshFromCookie: () => fetch(`${apiBaseUrl}/auth/refresh/cookie`, {
    method: "POST",
    credentials: "include",
  }),
  googleLoginUrl: `${backendBaseUrl}/oauth2/authorization/google`,
};
