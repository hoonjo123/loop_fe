import { LocateFixed } from "lucide-react";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";
import { getCurrentLocation, getCurrentLocationErrorMessage } from "../lib/getCurrentLocation";
import type { ApproximateLocation } from "../types";

type LocationStatus = "idle" | "loading" | "error";

type RegionMapProps = {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedLocation: ApproximateLocation | null;
  isSelectingLocation: boolean;
  onLocationSelect: (location: ApproximateLocation) => void;
  onLocationSelectCancel: () => void;
  onRoomSelect: (roomId: number) => void;
};

export function RegionMap({
  selectedRegion,
  onRegionChange,
  selectedLocation,
  isSelectingLocation,
  onLocationSelect,
  onLocationSelectCancel,
  onRoomSelect,
}: RegionMapProps) {
  const [currentLocation, setCurrentLocation] = useState<ApproximateLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");

  const moveToCurrentLocation = async () => {
    setLocationStatus("loading");
    setLocationMessage("현재 위치를 확인하고 있어요.");

    try {
      setCurrentLocation(await getCurrentLocation());
      setLocationStatus("idle");
      setLocationMessage("현재 위치로 이동했어요.");
    } catch (error) {
      setLocationStatus("error");
      setLocationMessage(getCurrentLocationErrorMessage(error));
    }
  };

  return (
    <section className="map-panel" aria-label="지역 지도">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">지금, 우리 동네</p>
          <h1>우리 동네에서 이어지는 대화</h1>
        </div>
        <button
          type="button"
          className="current-location-button"
          onClick={moveToCurrentLocation}
          disabled={locationStatus === "loading"}
        >
          <LocateFixed aria-hidden="true" />
          <span>{locationStatus === "loading" ? "위치 확인 중" : "현재 위치"}</span>
        </button>
        {locationMessage && (
          <p className={`current-location-message ${locationStatus === "error" ? "error" : ""}`} role="status">
            {locationMessage}
          </p>
        )}
      </div>

      <KakaoMap
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        selectedLocation={selectedLocation}
        isSelectingLocation={isSelectingLocation}
        onLocationSelect={onLocationSelect}
        onLocationSelectCancel={onLocationSelectCancel}
        onRoomSelect={onRoomSelect}
        currentLocation={currentLocation}
      />
    </section>
  );
}
