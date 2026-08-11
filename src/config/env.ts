export const env = {
  kakaoMapKey: import.meta.env.VITE_KAKAO_MAP_KEY ?? "",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  webSocketUrl: import.meta.env.VITE_WS_URL ?? "",
} as const;
