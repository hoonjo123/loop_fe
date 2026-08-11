import type { ApproximateLocation } from "../types";

export function getCurrentLocation(): Promise<ApproximateLocation> {
  if (!("geolocation" in navigator)) {
    return Promise.reject(new Error("GEOLOCATION_UNAVAILABLE"));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });
}

export function getCurrentLocationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "GEOLOCATION_UNAVAILABLE") {
    return "현재 브라우저에서는 위치 기능을 사용할 수 없어요.";
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 1) {
    return "위치 권한을 허용하면 현재 위치를 사용할 수 있어요.";
  }

  return "현재 위치를 확인하지 못했어요. 잠시 후 다시 시도해주세요.";
}
