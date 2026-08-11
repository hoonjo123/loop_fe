import type { Conversation } from "../types";

export const mockConversations: Conversation[] = [
  { id: 1, title: "마포 직장인 소소한 수다방", type: "OPEN", area: "마포구", message: "서윤: 다음 모임은 목요일 어떠세요?", time: "방금", unread: 3, people: 126 },
  { id: 2, title: "연남동 카페 탐험대", type: "OPEN", area: "연남동", message: "새로 생긴 로스터리 사진을 보냈어요.", time: "3분", unread: 1, people: 54 },
  { id: 3, title: "해질녘", type: "DIRECT", area: "1:1 대화", message: "오늘 산책 즐거웠어요! 조심히 들어가세요 🙂", time: "18분", unread: 2 },
  { id: 4, title: "퇴근 후, 망원 산책 한 바퀴", type: "OPEN", area: "망원동", message: "도착하신 분들은 입구에서 만나요.", time: "32분", unread: 0, people: 8 },
  { id: 5, title: "고라니", type: "DIRECT", area: "1:1 대화", message: "추천해주신 식당 저장해뒀어요!", time: "어제", unread: 0 },
  { id: 6, title: "합정 저녁메이트", type: "OPEN", area: "합정동", message: "민들레: 메뉴 후보 세 군데 올렸습니다.", time: "어제", unread: 0, people: 19 },
  { id: 7, title: "마포 러닝크루 느린발", type: "OPEN", area: "상암동", message: "이번 주 토요일 오전 8시 출발입니다.", time: "월", unread: 0, people: 37 },
];
