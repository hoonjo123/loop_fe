export function getDistrictName(regionLabel: string | null) {
  if (!regionLabel) return "지역 미상";

  const administrativeArea = regionLabel.split("·")[0].trim();
  const parts = administrativeArea.split(/\s+/);

  return parts[parts.length - 1] || administrativeArea;
}
