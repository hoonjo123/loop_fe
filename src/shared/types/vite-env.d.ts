interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_KAKAO_MAP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
