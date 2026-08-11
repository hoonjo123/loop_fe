export type RoomType = "영구" | "임시";

export type Region = {
  name: string;
  roomCount: number;
  latitude: number;
  longitude: number;
};

export type ApproximateLocation = {
  latitude: number;
  longitude: number;
};

export type Room = {
  id: number;
  title: string;
  area: string;
  type: RoomType;
  people: number;
  message: string;
  time: string;
};
