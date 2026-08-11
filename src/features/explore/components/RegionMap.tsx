import { KakaoMap } from "./KakaoMap";
import type { ApproximateLocation } from "../types";

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
  return (
    <section className="map-panel" aria-label="지역 지도">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">지금, 우리 동네</p>
          <h1>서울에서 이어지는 대화</h1>
        </div>
      </div>

      <KakaoMap
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        selectedLocation={selectedLocation}
        isSelectingLocation={isSelectingLocation}
        onLocationSelect={onLocationSelect}
        onLocationSelectCancel={onLocationSelectCancel}
        onRoomSelect={onRoomSelect}
      />
    </section>
  );
}
