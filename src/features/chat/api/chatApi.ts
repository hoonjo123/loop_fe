import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { env } from "@/src/config/env";
import type { ApiError } from "@/src/features/auth/api/authApi";
import { authenticatedFetch } from "@/src/shared/api/authenticatedFetch";

const apiBaseUrl = (env.apiBaseUrl || "http://localhost:8080/api").replace(/\/$/, "");
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const webSocketUrl = env.webSocketUrl || `${backendBaseUrl.replace(/^http/, "ws")}/ws`;

export type ChatRoom = {
  id: number;
  roomType: "OPEN" | "DIRECT";
  openChatType: "GROUP" | "ONE_TO_ONE" | null;
  title: string | null;
  description: string | null;
  regionLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "ACTIVE" | "CLOSED" | "BLINDED";
  ownerId: number;
  ownerNickname: string;
  memberCount: number;
  joined: boolean;
};

export type ChatMember = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  activityArea: string | null;
  introduction: string | null;
  role: "OWNER" | "MEMBER";
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderId: number | null;
  senderNickname: string | null;
  senderProfileImageUrl: string | null;
  messageType: "TEXT" | "IMAGE" | "SYSTEM";
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  deleted: boolean;
};

export type MessagePage = {
  messages: ChatMessage[];
  nextCursor: number | null;
  hasNext: boolean;
};

export type Conversation = {
  roomId: number;
  roomType: "OPEN" | "DIRECT";
  title: string;
  regionLabel: string;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  targetUserId: number | null;
  targetProfileImageUrl: string | null;
};

export type CreateRoomInput = {
  openChatType: "GROUP" | "ONE_TO_ONE";
  title: string;
  description: string;
  regionLabel: string;
  latitude: number;
  longitude: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      credentials: "include",
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
    const error = new Error(body.message ?? "채팅 요청을 처리하지 못했습니다.") as ApiError;
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const chatApi = {
  getOpenRooms: (region?: string) => request<ChatRoom[]>(`/chat-rooms${region ? `?region=${encodeURIComponent(region)}` : ""}`),
  getRoom: (roomId: number) => request<ChatRoom>(`/chat-rooms/${roomId}`),
  createRoom: (input: CreateRoomInput) => request<ChatRoom>("/chat-rooms", { method: "POST", body: JSON.stringify(input) }),
  joinRoom: (roomId: number) => request<ChatRoom>(`/chat-rooms/${roomId}/members`, { method: "POST" }),
  leaveRoom: (roomId: number) => request<void>(`/chat-rooms/${roomId}/members/me`, { method: "DELETE" }),
  kickMember: (roomId: number, userId: number) => request<void>(`/chat-rooms/${roomId}/members/${userId}`, { method: "DELETE" }),
  closeRoom: (roomId: number) => request<void>(`/chat-rooms/${roomId}`, { method: "DELETE" }),
  getMembers: (roomId: number) => request<ChatMember[]>(`/chat-rooms/${roomId}/members`),
  getConversations: () => request<Conversation[]>("/chat-rooms/me/conversations"),
  createDirectRoom: (targetUserId: number) => request<ChatRoom>("/chat-rooms/direct", { method: "POST", body: JSON.stringify({ targetUserId }) }),
  getMessages: (roomId: number, beforeId?: number) => request<MessagePage>(`/chat-rooms/${roomId}/messages${beforeId ? `?beforeId=${beforeId}` : ""}`),
  searchMessages: (roomId: number, query: string) => request<ChatMessage[]>(`/chat-rooms/${roomId}/messages/search?query=${encodeURIComponent(query)}`),
  deleteMessage: (roomId: number, messageId: number) => request<ChatMessage>(`/chat-rooms/${roomId}/messages/${messageId}`, { method: "DELETE" }),
  markRead: (roomId: number) => request<void>(`/chat-rooms/${roomId}/read`, { method: "PUT" }),
  blockUser: (userId: number) => request<void>(`/users/me/blocks/${userId}`, { method: "POST" }),
  report: (input: {
    reportedUserId?: number;
    reportedRoomId?: number;
    reportedMessageId?: number;
    reason: string;
    description?: string;
  }) => request<{ id: number; status: "PENDING" }>("/reports", { method: "POST", body: JSON.stringify(input) }),
};

export class ChatSocket {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private refreshTimer: number | null = null;

  connect(roomId: number, onMessage: (message: ChatMessage) => void, onError: (message: string) => void) {
    this.client = new Client({
      webSocketFactory: () => new WebSocket(webSocketUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.subscription = this.client?.subscribe(`/topic/chat/rooms/${roomId}`, (frame: IMessage) => {
          onMessage(JSON.parse(frame.body) as ChatMessage);
        }) ?? null;
      },
      onStompError: (frame) => onError(frame.headers.message ?? "실시간 채팅 연결에 실패했습니다."),
      onWebSocketError: () => onError("실시간 채팅 연결이 끊어졌습니다. 다시 연결하고 있어요."),
    });
    this.client.activate();
    this.refreshTimer = window.setInterval(() => {
      void this.reconnectWithFreshToken();
    }, 9 * 60 * 1000);
  }

  send(roomId: number, content: string) {
    if (!this.client?.connected) {
      throw new Error("채팅 서버에 연결 중입니다. 잠시 후 다시 시도해주세요.");
    }
    this.client.publish({
      destination: `/app/chat/rooms/${roomId}/messages`,
      body: JSON.stringify({ messageType: "TEXT", content, imageUrl: null }),
    });
  }

  disconnect() {
    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.subscription?.unsubscribe();
    this.subscription = null;
    void this.client?.deactivate();
    this.client = null;
  }

  private async reconnectWithFreshToken() {
    const refreshed = await fetch(`${apiBaseUrl}/auth/refresh/cookie`, {
      method: "POST",
      credentials: "include",
    });
    if (!refreshed.ok || !this.client) return;
    await this.client.deactivate();
    this.client.activate();
  }
}

export class ChatNotificationSocket {
  private client: Client | null = null;
  private subscriptions = new Map<number, StompSubscription>();
  private roomIds = new Set<number>();
  private onMessage: ((message: ChatMessage) => void) | null = null;
  private refreshTimer: number | null = null;

  connect(onMessage: (message: ChatMessage) => void) {
    this.onMessage = onMessage;
    this.client = new Client({
      webSocketFactory: () => new WebSocket(webSocketUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.subscriptions.clear();
        this.roomIds.forEach((roomId) => this.subscribe(roomId));
      },
    });
    this.client.activate();
    this.refreshTimer = window.setInterval(() => {
      void this.reconnectWithFreshToken();
    }, 9 * 60 * 1000);
  }

  syncRooms(roomIds: number[]) {
    const nextRoomIds = new Set(roomIds);

    this.subscriptions.forEach((subscription, roomId) => {
      if (!nextRoomIds.has(roomId)) {
        subscription.unsubscribe();
        this.subscriptions.delete(roomId);
      }
    });

    this.roomIds = nextRoomIds;
    if (!this.client?.connected) return;

    this.roomIds.forEach((roomId) => {
      if (!this.subscriptions.has(roomId)) this.subscribe(roomId);
    });
  }

  disconnect() {
    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();
    void this.client?.deactivate();
    this.client = null;
    this.onMessage = null;
  }

  private subscribe(roomId: number) {
    const subscription = this.client?.subscribe(
      `/topic/chat/rooms/${roomId}`,
      (frame) => this.onMessage?.(JSON.parse(frame.body) as ChatMessage),
    );
    if (subscription) this.subscriptions.set(roomId, subscription);
  }

  private async reconnectWithFreshToken() {
    const refreshed = await fetch(`${apiBaseUrl}/auth/refresh/cookie`, {
      method: "POST",
      credentials: "include",
    });
    if (!refreshed.ok || !this.client) return;
    await this.client.deactivate();
    this.subscriptions.clear();
    this.client.activate();
  }
}
