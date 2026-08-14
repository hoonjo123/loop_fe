import type { ChatRoom } from "@/src/features/chat/api/chatApi";

export type RoomCluster = {
  rooms: ChatRoom[];
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function getDistanceInMeters(
  first: Pick<RoomCluster, "latitude" | "longitude">,
  second: Pick<RoomCluster, "latitude" | "longitude">,
) {
  const latitudeDifference = toRadians(second.latitude - first.latitude);
  const longitudeDifference = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitude)
    * Math.cos(secondLatitude)
    * Math.sin(longitudeDifference / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

export function clusterRooms(rooms: ChatRoom[], distanceMeters: number) {
  return rooms.reduce<RoomCluster[]>((clusters, room) => {
    if (room.latitude === null || room.longitude === null) return clusters;

    const nearestCluster = clusters.find((cluster) =>
      getDistanceInMeters(cluster, {
        latitude: room.latitude!,
        longitude: room.longitude!,
      }) <= distanceMeters,
    );

    if (!nearestCluster) {
      clusters.push({
        rooms: [room],
        latitude: room.latitude,
        longitude: room.longitude,
      });
      return clusters;
    }

    const previousCount = nearestCluster.rooms.length;
    nearestCluster.rooms.push(room);
    nearestCluster.latitude =
      (nearestCluster.latitude * previousCount + room.latitude) / (previousCount + 1);
    nearestCluster.longitude =
      (nearestCluster.longitude * previousCount + room.longitude) / (previousCount + 1);

    return clusters;
  }, []);
}

export function getClusterDistanceMeters(zoomLevel: number) {
  const distancesByZoomLevel: Record<number, number> = {
    1: 15,
    2: 30,
    3: 60,
    4: 120,
    5: 240,
  };

  return distancesByZoomLevel[zoomLevel] ?? 60;
}
