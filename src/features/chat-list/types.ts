export type Conversation = {
  id: number;
  title: string;
  type: "OPEN" | "DIRECT";
  area: string;
  message: string;
  time: string;
  unread: number;
  people?: number;
};
