# loop frontend

지역 기반 소통 커뮤니티 `loop`의 프론트엔드 프로토타입입니다.

## 기술 구성

- Vite
- React
- TypeScript
- Kakao Maps JavaScript SDK

## 실행

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

## 환경 변수

루트의 `.env`에서 관리하며, 필요한 키는 `.env.example`을 참고합니다.

## 검증 및 빌드

```bash
npm run lint
npm run build
npm run preview
```

프로덕션 결과물은 `dist`에 생성되며 Vercel은 Vite 프로젝트로 자동 배포할 수 있습니다.
