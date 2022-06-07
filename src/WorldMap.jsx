import * as topojson from 'topojson-client';
import {
  geoOrthographic,
  geoPath,
  geoEquirectangular,
  geoCircle
} from 'd3-geo';
import add from 'date-fns/add'
import topo from './countries-110m.json'
import { getSatelliteLatLng, getSunLatLng } from "./satellite"
import { useControls } from "leva"
import useSVGDownload from './useSVGDownload';
import { useRef } from 'react';

function Countries({ path }) {
  const world = topojson.feature(topo, topo.objects.countries);
  const { color, bg, gap } = useControls({
    color: { value: "#9cbbcb" },
    bg: { value: "#2e4690" },
    gap: { value: 0.5, min: 0, max: 2 }
  });
  return (
    <>
      <path
        d={path({"type": "Sphere"})}
        fill={bg}
      />
      {world.features.map((feature, i) => (
        <path
          key={`map-feature-${i}`}
          d={path(feature)}
          fill={color}
          stroke={bg}
          strokeWidth={gap}
          style={{ opacity: 0.5 }}
        />
      ))}
    </>
    
  )
}

const antipode = ([longitude, latitude]) => [longitude + 180, -latitude]

function Shade({ path, date = new Date() }) {

  const { lat, lng } = getSunLatLng(date);
  const night = geoCircle().radius(90).center(antipode([lng, lat]))
  //const sun = geoCircle().radius(90).center([lng, lat])

  return (
    <path
      d={path(night())}
      fill="#1c1e2f51"
    />
  )
}

function Grid({ path }) {
  const { red } = useControls({
    red: { value: "#ff7878" }
  });
  return (
    <> 
      {[...Array(72+1)].map((_, i) => {
        const x = (i - 18) * 5
        return (
          <path
            key={i}
            d={path({
              "type": "LineString",
              "coordinates": [...Array(36+1)].map((_, i) => [x, (i - 18) * 5])
            })}
            fill="none"
            stroke={"white"}
            strokeWidth={0.5}
            style={{ opacity: x % 30 === 0 ? 0.7 : x % 10 === 0 ? 0.25: 0.1 }}
          />
        )
      })}
      {[...Array(36+1)].map((_, i) => {
        const y = (i - 18) * 5
        return (
          <path
            key={i}
            d={path({
              "type": "LineString",
              "coordinates": [...Array(36+1)].map((_, i) => [(i - 18) * 10, y])
            })}
            fill="none"
            stroke={y === 0 ? red : "white"}
            strokeWidth={0.5}
            style={{ opacity: y === 0 ? 1 : y % 30 === 0 ? 0.7 : y % 10 === 0 ? 0.25: 0.1 }}
          />
        )
      })}
      
    </>
    
  )
}


function Lines({ date = new Date(), path }) {
  const points = [...Array(90)].map((_, i) => {
    const { lat, lng } = getSatelliteLatLng(add(date, { minutes: i }))
    return [lng, lat]
  })

  const line = {
    "type": "LineString",
    "coordinates": points
  }
  
  const { orbit, width } = useControls({
    orbit: { value: "#fff" },
    width: { value: 2, min: 0, max: 2 }
  });
  return (
    <path
      d={path(line)}
      fill="none"
      stroke={orbit}
      strokeWidth={width}
    />
  )
}

function SphereMap({ width = 400, height = 400, date = new Date() }){
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width * 0.4;
  const translate = [centerX, centerY]
  const projection = geoOrthographic().translate(translate).scale(scale)
  const orbitProjection = geoOrthographic().clipAngle(112).translate(translate).scale(scale * 1.07)
  const path = geoPath().projection(projection);

  return (
    <svg width={width} height={height}>
      <Countries path={path} />
      <Lines projection={orbitProjection} date={date} path={geoPath().projection(orbitProjection)}/>
      <Grid path={path} projection={projection}/>
      <Shade path={path} date={date}/>

    </svg>
  );
};

function Globe({ path }) {
  return (
    <path
      d={path({"type": "Sphere"})}
      fill={"red"}
    />
  )
}

function EquirectangularMap({ width = 800, height = 400, date = new Date() }) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;
  const translate = [centerX, centerY]
  const projection = geoEquirectangular().translate(translate).scale(scale)
  const path = geoPath().projection(projection);
  const ref = useRef();
  useSVGDownload(ref)
  return (
    <svg width={width} height={height} ref={ref}>
      <Countries path={path} />
      <Grid path={path}  projection={projection}/>
      <Shade path={path}  date={date}/>
      <Lines projection={projection} date={date} path={path}/>

    </svg>
  );
}

export { SphereMap, EquirectangularMap }