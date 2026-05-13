// ATLAS · cinematic SVG globe
// Two states:
//   IDLE     — atmospheric world view, single aircraft on tilted orbit (44s loop).
//   ROUTE    — re-orients to the route midpoint, zooms in like Google Maps,
//              draws the great-circle corridor between origin & destination,
//              aircraft re-attaches to the corridor (10s loop).

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { getAirportByIata } from '../lib/airports.js';
import { EASE } from '../lib/motion.js';

const GLOBE_R = 175;
const IDLE_VIEWBOX = '-220 -220 440 440';

// Angular midpoint that handles the antimeridian (e.g. LAX → SYD)
function midLng(a, b) {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  let m = a + diff / 2;
  if (m > 180) m -= 360;
  if (m < -180) m += 360;
  return m;
}
function projectAt(lat, lng, lonCenter) {
  const lambda = ((lng - lonCenter) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  return {
    x: GLOBE_R * Math.cos(phi) * Math.sin(lambda),
    y: -GLOBE_R * Math.sin(phi),
  };
}

export default function Globe({ focusMode = false, routeMode = false }) {
  const query = useFlightStore(s => s.query);
  const mapAnimations = useFlightStore(s => s.settings.mapAnimations);

  // === Compute the zoomed view + route geometry only in route mode ===
  const focused = useMemo(() => {
    if (!routeMode) return null;
    const a = getAirportByIata(query.from);
    const b = getAirportByIata(query.to);
    if (!a || !b) return null;

    // Re-orient so the route's midpoint is at the projection centre
    const lonCenter = midLng(a.lng, b.lng);
    const pa = projectAt(a.lat, a.lng, lonCenter);
    const pb = projectAt(b.lat, b.lng, lonCenter);

    // Quadratic-bezier control point pulled outward for an arc feel
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const lenC = Math.hypot(mx, my) || 1;
    // Lift the arc — larger for short routes so it still reads as a curve
    const span = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const lift = Math.max(28, Math.min(70, span * 0.32));
    const cx = mx + (mx / lenC) * lift;
    const cy = my + (my / lenC) * lift;

    // Bounding box around both endpoints + arc apex, padded for breathing room
    const padX = Math.max(50, span * 0.45);
    const padY = Math.max(40, span * 0.32);
    const minX = Math.min(pa.x, pb.x, cx) - padX;
    const maxX = Math.max(pa.x, pb.x, cx) + padX;
    const minY = Math.min(pa.y, pb.y, cy) - padY;
    const maxY = Math.max(pa.y, pb.y, cy) + padY;

    // Lock viewBox to a 1:1 aspect (map panel is roughly square)
    let w = maxX - minX;
    let h = maxY - minY;
    const side = Math.max(w, h, 160);            // never zoom in past 160-unit side
    const cxBox = (minX + maxX) / 2;
    const cyBox = (minY + maxY) / 2;
    const viewBox = `${(cxBox - side / 2).toFixed(1)} ${(cyBox - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`;

    return {
      lonCenter, pa, pb, cx, cy,
      d: `M ${pa.x.toFixed(1)} ${pa.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${pb.x.toFixed(1)} ${pb.y.toFixed(1)}`,
      viewBox,
      fromIata: a.iata, toIata: b.iata,
      fromCity: a.city, toCity: b.city,
    };
  }, [routeMode, query.from, query.to]);

  // The continents are stylized blobs; when we re-orient they look "off".
  // Rotate them horizontally by -Δlon so they roughly follow the new centre,
  // and fade them down so the route corridor becomes the focal point.
  const continentTransform = focused
    ? `rotate(0) translate(${(-focused.lonCenter * 1.2).toFixed(1)}, 0)`
    : 'translate(0,0)';
  const continentOpacity = focused ? 0.45 : 1;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={false}
      animate={{ scale: focusMode ? 0.94 : 1, opacity: focusMode ? 0.7 : 1 }}
      transition={{ duration: 1.2, ease: EASE.outExpo }}
      aria-hidden="true"
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[130vmin] h-[130vmin] max-w-[880px] max-h-[880px]"
        initial={false}
        animate={{ viewBox: focused ? focused.viewBox : IDLE_VIEWBOX }}
        transition={{ duration: 1.6, ease: EASE.outExpo }}
      >
        <defs>
          <radialGradient id="sphereGrad" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#1A2030" stopOpacity="1" />
            <stop offset="55%"  stopColor="#0E121C" stopOpacity="1" />
            <stop offset="100%" stopColor="#06080F" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="terminator" cx="80%" cy="50%">
            <stop offset="0%"   stopColor="rgba(201,166,107,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
          </radialGradient>
          <radialGradient id="haloGrad" cx="50%" cy="50%">
            <stop offset="60%"  stopColor="rgba(201,166,107,0)" />
            <stop offset="85%"  stopColor="rgba(201,166,107,0.08)" />
            <stop offset="100%" stopColor="rgba(201,166,107,0)" />
          </radialGradient>
          <g id="continents" fill="rgba(201,166,107,0.10)" stroke="rgba(201,166,107,0.18)" strokeWidth="0.5">
            <path d="M-150,-90 Q-130,-110 -100,-95 Q-90,-80 -100,-50 Q-120,-30 -140,-50 Q-155,-70 -150,-90 Z" />
            <path d="M-110,10 Q-100,0 -90,15 Q-85,50 -95,85 Q-105,80 -110,55 Q-115,30 -110,10 Z" />
            <path d="M-5,-40 Q15,-50 30,-30 Q35,0 25,40 Q10,55 0,50 Q-15,20 -10,-10 Q-10,-30 -5,-40 Z" />
            <path d="M-15,-90 Q5,-100 25,-90 Q30,-75 15,-65 Q-5,-65 -20,-75 Q-20,-85 -15,-90 Z" />
            <path d="M35,-90 Q90,-100 130,-70 Q140,-40 110,-20 Q70,-10 45,-40 Q30,-65 35,-90 Z" />
            <path d="M55,-15 Q70,-15 75,5 Q70,25 60,20 Q50,5 55,-15 Z" />
            <path d="M115,45 Q145,40 155,60 Q150,80 125,80 Q105,70 115,45 Z" />
          </g>
        </defs>

        {/* Atmosphere & sphere */}
        <circle cx="0" cy="0" r="215" fill="url(#haloGrad)" />
        <circle cx="0" cy="0" r="180" fill="url(#sphereGrad)" />
        <circle cx="0" cy="0" r="180" fill="url(#terminator)" />

        {/* Lat / Lng grid */}
        <g fill="none" stroke="rgba(239,234,224,0.06)" strokeWidth="0.5">
          <ellipse cx="0" cy="0" rx="180" ry="22" />
          <ellipse cx="0" cy="0" rx="178" ry="62" />
          <ellipse cx="0" cy="0" rx="172" ry="100" />
          <ellipse cx="0" cy="0" rx="160" ry="140" />
        </g>
        <g fill="none" stroke="rgba(239,234,224,0.05)" strokeWidth="0.5">
          <ellipse cx="0" cy="0" rx="22"  ry="180" />
          <ellipse cx="0" cy="0" rx="62"  ry="178" />
          <ellipse cx="0" cy="0" rx="100" ry="172" />
          <ellipse cx="0" cy="0" rx="140" ry="160" />
        </g>

        {/* Continents — fade & shift when zooming into a route */}
        <motion.g
          initial={false}
          animate={{ opacity: continentOpacity }}
          transition={{ duration: 1.4, ease: EASE.outExpo }}
          style={{ transform: continentTransform, transformOrigin: 'center' }}
        >
          <use href="#continents" />
        </motion.g>

        {/* Equator */}
        <line x1="-180" y1="0" x2="180" y2="0"
              stroke="rgba(201,166,107,0.12)" strokeWidth="0.5" strokeDasharray="2,4" />

        {/* Idle orbit OR zoomed route */}
        {!focused ? (
          <g>
            <ellipse
              id="orbit-path"
              cx="0" cy="0" rx="210" ry="55"
              fill="none"
              stroke="rgba(201,166,107,0.18)"
              strokeWidth="0.6"
              strokeDasharray="1.5,3"
              transform="rotate(-18)"
            />
            {mapAnimations && (
              <g style={{ filter: 'drop-shadow(0 0 6px rgba(201,166,107,0.55))' }}>
                <g transform="translate(-7,-7)">
                  <path
                    d="M 7 0 L 9 6 L 14 6 L 11 8 L 13 13 L 7 10 L 1 13 L 3 8 L 0 6 L 5 6 Z"
                    fill="rgba(201,166,107,0.92)"
                  />
                </g>
                <animateMotion dur="44s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#orbit-path" />
                </animateMotion>
              </g>
            )}
          </g>
        ) : (
          <g>
            {/* Underlying soft pulse beacons at both endpoints */}
            <BeaconRing x={focused.pa.x} y={focused.pa.y} delay={0} />
            <BeaconRing x={focused.pb.x} y={focused.pb.y} delay={1.4} />

            {/* The route corridor */}
            <motion.path
              id="corridor-path"
              d={focused.d}
              fill="none"
              stroke="rgba(201,166,107,0.85)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="2.5,4"
              style={{ filter: 'drop-shadow(0 0 6px rgba(201,166,107,0.55))' }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: EASE.outExpo, delay: 0.8 }}
            />

            {/* Airport markers with labels */}
            <AirportMarker x={focused.pa.x} y={focused.pa.y} iata={focused.fromIata} city={focused.fromCity} delay={1.3} />
            <AirportMarker x={focused.pb.x} y={focused.pb.y} iata={focused.toIata}   city={focused.toCity}   delay={1.6} />

            {/* Aircraft riding the corridor */}
            {mapAnimations && (
              <g style={{ filter: 'drop-shadow(0 0 8px rgba(201,166,107,0.85))' }}>
                <g transform="translate(-7,-7)">
                  <path
                    d="M 7 0 L 9 6 L 14 6 L 11 8 L 13 13 L 7 10 L 1 13 L 3 8 L 0 6 L 5 6 Z"
                    fill="rgba(201,166,107,0.98)"
                  />
                </g>
                <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#corridor-path" />
                </animateMotion>
              </g>
            )}
          </g>
        )}
      </motion.svg>
    </motion.div>
  );
}

function BeaconRing({ x, y, delay }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
      <motion.circle
        r={12}
        fill="none"
        stroke="rgba(201,166,107,0.55)"
        strokeWidth="0.6"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.4, 3.0, 4.0] }}
        transition={{ duration: 3.4, ease: 'easeOut', repeat: Infinity, delay }}
      />
      <motion.circle
        r={6}
        fill="rgba(201,166,107,0.18)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, delay }}
      />
    </g>
  );
}

function AirportMarker({ x, y, iata, city, delay }) {
  return (
    <motion.g
      transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE.outExpo, delay }}
    >
      <circle r="3.4" fill="rgba(201,166,107,0.98)" />
      <circle r="6"   fill="none" stroke="rgba(201,166,107,0.6)" strokeWidth="0.7" />
      <text x="0" y="-12"
            fontFamily='"JetBrains Mono", monospace'
            fontSize="6.5"
            fill="rgba(239,234,224,0.78)"
            textAnchor="middle"
            letterSpacing="0.5">
        {iata}
      </text>
      <text x="0" y="14"
            fontFamily='Fraunces, serif'
            fontStyle="italic"
            fontSize="7"
            fill="rgba(239,234,224,0.6)"
            textAnchor="middle">
        {city}
      </text>
    </motion.g>
  );
}
