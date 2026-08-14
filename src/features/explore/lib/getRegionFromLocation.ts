import { env } from "@/src/config/env";
import type { ApproximateLocation } from "../types";
import { loadKakaoMaps } from "./loadKakaoMaps";

export async function getRegionFromLocation(location: ApproximateLocation) {
  const maps = await loadKakaoMaps(env.kakaoMapKey);
  const geocoder = new maps.services.Geocoder();

  return new Promise<string>((resolve, reject) => {
    geocoder.coord2RegionCode(location.longitude, location.latitude, (result, status) => {
      if (status !== maps.services.Status.OK || result.length === 0) {
        reject(new Error("선택한 위치의 행정구역을 확인하지 못했습니다. 다시 시도해주세요."));
        return;
      }

      const region = result.find((item) => item.region_type === "H") ?? result[0];
      const regionLabel = [region.region_1depth_name, region.region_2depth_name]
        .filter(Boolean)
        .join(" ");
      if (!region.region_2depth_name) {
        reject(new Error("선택한 위치의 시·군·구 정보를 확인하지 못했습니다."));
        return;
      }
      resolve(regionLabel);
    });
  });
}
