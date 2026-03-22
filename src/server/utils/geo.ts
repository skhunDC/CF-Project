const EARTH_METERS_PER_DEGREE = 111_320;

export const blurCoordinates = (lat: number, lng: number, radiusMeters: number) => {
  const latDelta = radiusMeters / EARTH_METERS_PER_DEGREE;
  const lngDelta = radiusMeters / (EARTH_METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180));

  const roundedLat = Math.round(lat / latDelta) * latDelta;
  const roundedLng = Math.round(lng / lngDelta) * lngDelta;

  return {
    publicLat: Number(roundedLat.toFixed(4)),
    publicLng: Number(roundedLng.toFixed(4)),
    geohash: `${roundedLat.toFixed(2)}:${roundedLng.toFixed(2)}`,
  };
};
