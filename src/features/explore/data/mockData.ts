import type { Region, Room } from "../types";

export const regions: Region[] = [
  { name: "은평구", count: 8, latitude: 37.6027, longitude: 126.9291 },
  { name: "마포구", count: 23, hot: true, latitude: 37.5663, longitude: 126.9019 },
  { name: "서대문구", count: 14, latitude: 37.5791, longitude: 126.9368 },
  { name: "종로구", count: 12, latitude: 37.5735, longitude: 126.979 },
  { name: "용산구", count: 9, latitude: 37.5326, longitude: 126.9905 },
  { name: "성동구", count: 18, hot: true, latitude: 37.5633, longitude: 127.0371 },
  { name: "강남구", count: 41, hot: true, latitude: 37.5172, longitude: 127.0473 },
  { name: "송파구", count: 27, latitude: 37.5145, longitude: 127.1058 },
  { name: "영등포구", count: 16, latitude: 37.5263, longitude: 126.8962 },
];

export const rooms: Room[] = [
  {
    id: 1,
    title: "퇴근 후, 망원 산책 한 바퀴",
    area: "망원동",
    type: "임시",
    people: 8,
    message: "날씨가 좋아서 천천히 걸으려고요!",
    time: "오늘 20:00 종료",
  },
  {
    id: 2,
    title: "마포 직장인 소소한 수다방",
    area: "마포구",
    type: "영구",
    people: 126,
    message: "이번 주말에 근처 맛집 가실 분?",
    time: "방금 전 대화",
  },
  {
    id: 3,
    title: "연남동 카페 탐험대",
    area: "연남동",
    type: "영구",
    people: 54,
    message: "새로 생긴 로스터리 후기 올렸어요 ☕",
    time: "3분 전 대화",
  },
  {
    id: 4,
    title: "오늘 저녁 합정에서 밥 먹어요",
    area: "합정동",
    type: "임시",
    people: 4,
    message: "한 자리 남았어요. 메뉴는 같이 정해요!",
    time: "오늘 22:00 종료",
  },
];
