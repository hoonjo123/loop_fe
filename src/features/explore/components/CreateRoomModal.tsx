"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { ApproximateLocation } from "../types";
import { chatApi, type ChatRoom } from "@/src/features/chat/api/chatApi";

type CreateRoomModalProps = {
  locationLabel: string;
  location: ApproximateLocation;
  onClose: () => void;
  onCreated: (room: ChatRoom) => void;
};

type RoomType = "GROUP" | "ONE_TO_ONE";

export function CreateRoomModal({ locationLabel, location, onClose, onCreated }: CreateRoomModalProps) {
  const [roomType, setRoomType] = useState<RoomType>("GROUP");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      const room = await chatApi.createRoom({
        openChatType: roomType,
        title: String(form.get("title")),
        description: String(form.get("description")),
        regionLabel: String(form.get("region")),
        latitude: location.latitude,
        longitude: location.longitude,
      });
      onCreated(room);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "채팅방을 만들지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-room-modal" role="dialog" aria-modal="true" aria-labelledby="create-room-title">
      <button className="preview-backdrop" onClick={onClose} aria-label="채팅방 만들기 닫기" />
      <article>
        <header className="create-room-header">
          <div>
            <span>새로운 대화 시작하기</span>
            <h2 id="create-room-title">채팅방 만들기</h2>
            <p>동네 사람들과 나눌 대화를 시작해보세요.</p>
          </div>
          <button className="create-room-close" onClick={onClose} aria-label="닫기" type="button">
            <X aria-hidden="true" />
          </button>
        </header>

        <form className="create-room-form" onSubmit={handleSubmit}>
          <fieldset className="room-type-field">
            <legend>채팅방 유형</legend>
            <div className="room-type-options">
              <button
                className={roomType === "GROUP" ? "active" : ""}
                onClick={() => setRoomType("GROUP")}
                type="button"
              >
                <strong>그룹채팅</strong>
                <span>참여자 모두가 한 방에서 대화해요</span>
              </button>
              <button
                className={roomType === "ONE_TO_ONE" ? "active" : ""}
                onClick={() => setRoomType("ONE_TO_ONE")}
                type="button"
              >
                <strong>1:1 채팅</strong>
                <span>참여자마다 방장과 따로 대화해요</span>
              </button>
            </div>
          </fieldset>

          <label className="create-room-field">
            <span>채팅방 이름</span>
            <input name="title" maxLength={40} placeholder="예: 퇴근 후 망원동 산책해요" required />
            <small>최대 40자</small>
          </label>

          <label className="create-room-field">
            <span>채팅방 소개</span>
            <textarea name="description" maxLength={120} placeholder="어떤 이야기를 나누는 방인지 알려주세요." required />
            <small>최대 120자</small>
          </label>

          <div className="create-room-grid single">
            <label className="create-room-field">
              <span>대략적인 위치</span>
              <input name="region" value={locationLabel} readOnly />
              <input name="latitude" value={location.latitude.toFixed(3)} readOnly hidden />
              <input name="longitude" value={location.longitude.toFixed(3)} readOnly hidden />
              <small>약 100m 단위로만 위치가 표시됩니다.</small>
            </label>

          </div>

          <p className="create-room-notice">정확한 위치는 다른 사용자에게 공개되지 않아요.</p>
          {error && <p className="create-room-error" role="alert">{error}</p>}
          <button className="create-room-submit" type="submit" disabled={submitting}>
            {submitting ? "만드는 중..." : "채팅방 만들기"}
          </button>
        </form>
      </article>
    </div>
  );
}
