export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMapMouseEvent = {
  latLng: KakaoLatLng;
};

export type KakaoMapInstance = {
  getLevel: () => number;
  panTo: (position: KakaoLatLng) => void;
  relayout: () => void;
  setCenter: (position: KakaoLatLng) => void;
  setLevel: (level: number, options?: { anchor?: KakaoLatLng; animate?: boolean }) => void;
};

export type KakaoCustomOverlayInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

export type KakaoRegionCode = {
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  region_type: "H" | "B";
};

export type KakaoGeocoder = {
  coord2RegionCode: (
    longitude: number,
    latitude: number,
    callback: (result: KakaoRegionCode[], status: string) => void,
  ) => void;
};

export type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  CustomOverlay: new (options: {
    content: HTMLElement;
    map: KakaoMapInstance;
    position: KakaoLatLng;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlayInstance;
  services: {
    Geocoder: new () => KakaoGeocoder;
    Status: { OK: string };
  };
  event: {
    addListener: (
      target: KakaoMapInstance,
      eventName: "click" | "zoom_changed" | "idle",
      handler: ((event: KakaoMapMouseEvent) => void) | (() => void),
    ) => void;
    removeListener: (
      target: KakaoMapInstance,
      eventName: "click" | "zoom_changed" | "idle",
      handler: ((event: KakaoMapMouseEvent) => void) | (() => void),
    ) => void;
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsApi };
  }
}
