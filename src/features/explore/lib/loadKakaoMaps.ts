import type { KakaoMapsApi } from "@/src/shared/types/kakao-maps";

const SCRIPT_ID = "kakao-maps-sdk";
let kakaoMapsPromise: Promise<KakaoMapsApi> | null = null;

export function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  if (kakaoMapsPromise) {
    return kakaoMapsPromise;
  }

  kakaoMapsPromise = new Promise((resolve, reject) => {
    if (!appKey) {
      reject(new Error("Kakao Maps JavaScript 키가 설정되지 않았습니다."));
      return;
    }

    const resolveKakaoMaps = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK를 불러오지 못했습니다."));
        return;
      }

      window.kakao.maps.load(() => resolve(window.kakao!.maps));
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.kakao?.maps) {
        resolveKakaoMaps();
      } else {
        existingScript.addEventListener("load", resolveKakaoMaps, { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Kakao Maps SDK 요청에 실패했습니다.")), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.addEventListener("load", resolveKakaoMaps, { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao Maps SDK 요청에 실패했습니다.")), { once: true });
    document.head.appendChild(script);
  });

  return kakaoMapsPromise;
}
