"use client";

import { LocateFixed, MapPin, X } from "lucide-react";
import { useState } from "react";
import { getCurrentLocation, getCurrentLocationErrorMessage } from "../lib/getCurrentLocation";
import type { ApproximateLocation } from "../types";

type LocationMethodModalProps = {
  onClose: () => void;
  onChooseCurrentLocation: (location: ApproximateLocation) => void;
  onChooseMap: () => void;
};

export function LocationMethodModal({
  onClose,
  onChooseCurrentLocation,
  onChooseMap,
}: LocationMethodModalProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const chooseCurrentLocation = async () => {
    setIsLocating(true);
    setErrorMessage("");

    try {
      onChooseCurrentLocation(await getCurrentLocation());
    } catch (error) {
      setErrorMessage(getCurrentLocationErrorMessage(error));
      setIsLocating(false);
    }
  };

  return (
    <div className="location-method-modal" role="dialog" aria-modal="true" aria-labelledby="location-method-title">
      <button className="preview-backdrop" onClick={onClose} aria-label="위치 선택 닫기" />
      <article>
        <button className="create-room-close" onClick={onClose} aria-label="닫기" type="button">
          <X aria-hidden="true" />
        </button>
        <header>
          <span>채팅방 만들기</span>
          <h2 id="location-method-title">위치를 어떻게 지정할까요?</h2>
          <p>정확한 위치는 다른 사용자에게 공개되지 않아요.</p>
        </header>

        <div className="location-method-options">
          <button type="button" onClick={chooseCurrentLocation} disabled={isLocating}>
            <span className="location-method-icon"><LocateFixed aria-hidden="true" /></span>
            <span>
              <strong>{isLocating ? "현재 위치 확인 중" : "현재 위치로 지정"}</strong>
              <small>지금 있는 곳 주변으로 빠르게 설정해요</small>
            </span>
          </button>
          <button type="button" onClick={onChooseMap} disabled={isLocating}>
            <span className="location-method-icon"><MapPin aria-hidden="true" /></span>
            <span>
              <strong>지도에서 직접 지정</strong>
              <small>지도에서 원하는 대략적인 위치를 선택해요</small>
            </span>
          </button>
        </div>

        {errorMessage && <p className="location-method-error" role="alert">{errorMessage}</p>}
      </article>
    </div>
  );
}
