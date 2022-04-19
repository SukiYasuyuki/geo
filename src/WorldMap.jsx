import * as topojson from 'topojson-client';
import {
  geoOrthographic,
  geoPath,
  geoGraticule,
  geoEquirectangular
} from 'd3-geo';
import add from 'date-fns/add'
import topo from './countries-110m.json'
import { getSatelliteLatLng } from "./satellite"

function Countries({ path }) {
  const world = topojson.feature(topo, topo.objects.countries);
  return world.features.map((feature, i) => (
    <path
      key={`map-feature-${i}`}
      d={path(feature)}
      fill="lightgray"
      stroke="darkgray"
      strokeWidth={1}
    />
  ))
}

function Graticule({ path }) {
  return (
    <path
      d={path(geoGraticule()())}
      fill="transparent"
      stroke="lightgray"
      strokeWidth={1}
    />
  )
}

function Orbit({ projection, date = new Date() }) {

  const points = [...Array(90)].map((_, i) => {
    const { lat, lng } = getSatelliteLatLng(add(date, { minutes: i }))
    const xy = projection([lng, lat])
    return `${xy[0]},${xy[1]}`
  }).reduce((acc, value) => `${acc} ${value}`);

  return (
    <polyline
      fill="none"
      stroke="red"
      strokeWidth={2}
      points={points}
    />
  )
}

function SphereMap({ width = 400, height = 400, date = new Date() }){
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width * 0.4;
  const translate = [centerX, centerY]
  const projection = geoOrthographic().translate(translate).scale(scale)
  const orbitProjection = geoOrthographic().translate(translate).scale(scale * 1.07)
  const path = geoPath().projection(projection);

  return (
    <svg width={width} height={height}>
      <Countries path={path} />
      <Graticule path={path} />
      <Orbit projection={orbitProjection} date={date} />
    </svg>
  );
};

function EquirectangularMap({ width = 800, height = 400, date = new Date() }) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;
  const translate = [centerX, centerY]
  const projection = geoEquirectangular().translate(translate).scale(scale);
  const path = geoPath().projection(projection);

  return (
    <svg width={width} height={height}>
      <Countries path={path} />
      <Graticule path={path} />
      <Orbit projection={projection} date={date} />
    </svg>
  );
}

export { SphereMap, EquirectangularMap }