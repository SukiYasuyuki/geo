import * as satellite from "satellite.js"
import { century, equationOfTime, declination } from "solar-calculator"

const ISS_TLE = 
    `1 25544U 98067A   21122.75616700  .00027980  00000-0  51432-3 0  9994
     2 25544  81.6442 207.4449 0002769 310.1189 193.6568 15.48993527281553`;

const satrec = satellite.twoline2satrec(
  ISS_TLE.split('\n')[0].trim(), 
  ISS_TLE.split('\n')[1].trim()
);

export function getSatelliteLatLng(date) {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const gmst = satellite.gstime(date);
  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

  const lat = satellite.degreesLat(position.latitude);
  const lng = satellite.degreesLong(position.longitude)
  return { lat, lng }
}

export function getSunLatLng(date = new Date) {
  const now = date
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = century(now);
  const longitude = (day - now) / 864e5 * 360 - 180;
  const lng = longitude - equationOfTime(t) / 4
  const lat = declination(t)
  return { lat, lng }
}