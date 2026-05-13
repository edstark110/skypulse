// ATLAS · cinematic SVG globe
// Idle: aircraft orbits on tilted ellipse (44s loop).
// Results: route corridor drawn from origin → destination via quadratic arc.
// Honest decorative motion — never claims to be live telemetry.

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { getAirportByIata } from '../lib/airports.js';
import { EASE } from '../lib/motion.js';

const GLOBE_R = 175;
const LON_CENTER = 20;

function project(lat, lng) {
  const lambda = ((lng - LON_CENTER) * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const x = GLOBE_R * Math.cos(phi) * Math.sin(lambda);
  const y = -GLOBE_R * Math.sin(phi);
  return { x, y, visible: Math.cos(phi) * Math.cos(lambda) >= 0 };
}

export default function Globe({ focusMode = false, routeMode = false }) {
  const query = useFlightStore(s => s.query);
  const mapAnimations = useFlightStore(s => s.settings.mapAnimations);

  const route = useMemo(() => {
    if (!routeMode) return null;
    const a = getAirportByIata(query.from);
    const b = getAirportByIata(query.to);
    if (!a || !b) return null;
    const pa = project(a.lat, a.lng);
    const pb = project(b.lat, b.lng);
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const lenC = Math.hypot(mx, my) || 1;
    const lift = 60;
    const cx = mx + (mx / lenC) * lift;
    const cy = my + (my / lenC) * lift;
    return {
      pa, pb, cx, cy, fromIata: a.iata, toIata: b.iata,
      d: `M ${pa.x.toFixed(1)} ${pa.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${pb.x.toFixed(1)} ${pb.y.toFixed(1)}`,
    };
  }, [routeMode, query.from, query.to]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={false}
      animate={{
        scale: focusMode ? 0.94 : routeMode ? 1.04 : 1,
        opacity: focusMode ? 0.7 : 1,
      }}
      transition={{ duration: 1.2, ease: EASE.outExpo }}
      aria-hidden="true"
    >
      <svg
        viewBox="-220 -220 440 440"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[130vmin] h-[130vmin] max-w-[880px] max-h-[880px]"
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
            <path d="M-150,-90 Q-130,-110 -100,-95 Q-90,-80 -100,-50 Q-120,-30 -140,-50 Q-155,-70 -150,-90 Z"/>
            <path d="M-110,10 Q-100,0 -90,15 Q-85,50 -95,85 Q-105,80 -110,55 Q-115,30 -110,10 Z"/>
            <path d="M-5,-40 Q15,-50 30,-30 Q35,0 25,40 Q10,55 0,50 Q-15,20 -10,-10 Q-10,-30 -5,-40 Z"/>
            <path d="M-15,-90 Q5,-100 25,-90 Q30,-75 15,-65 Q-5,-65 -20,-75 Q-20,-85 -15,-90 Z"/>
            <path d="M35,-90 Q90,-100 130,-70 Q140,-40 110,-20 Q70,-10 45,-40 Q30,-65 35,-90 Z"/>
            <path d="M55,-15 Q70,-15 75,5 Q70,25 60,20 Q50,5 55,-15 Z"/>
            <path d="M115,45 Q145,40 155,60 Q150,80 125,80 Q105,70 115,45 Z"/>
          </g>
        </defs>

        <circle cx="0" cy="0" r="215" fill="url(#haloGrad)" />
        <circle cx="0" cy="0" r="180" fill="url(#sphereGrad)" />
        <circle cx="0" cy="0" r="180" fill="url(#terminator)" />

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

        <use href="#continents" />
        <line
          x1="-180" y1="0" x2="180" y2="0"
          stroke="rgba(201,166,107,0.12)" strokeWidth="0.5" strokeDasharray="2,4"
        />

        {/* Idle orbit OR route corridor */}
        {!route ? (
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
            <motion.path
              id="corridor-path"
              d={route.d}
              fill="none"
              stroke="rgba(201,166,107,0.8)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="2,3"
              style={{ filter: 'drop-shadow(0 0 4px rgba(201,166,107,0.5))' }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: EASE.outExpo, delay: 0.2 }}
            />
            <g transform={`translate(${route.pa.x.toFixed(1)},${route.pa.y.toFixed(1)})`}>
              <circle r="8" fill="rgba(201,166,107,0.12)" className="animate-node-pulse" />
              <circle r="3" fill="rgba(201,166,107,0.95)" />
              <text x="0" y="-14" fontFamily='"JetBrains Mono", monospace' fontSize="9"
                fill="rgba(239,234,224,0.7)" textAnchor="middle" letterSpacing="1">
                {route.fromIata}
              </text>
            </g>
            <g transform={`translate(${route.pb.x.toFixed(1)},${route.pb.y.toFixed(1)})`}>
              <circle r="8" fill="rgba(201,166,107,0.12)" className="animate-node-pulse"
                style={{ animationDelay: '1s' }} />
              <circle r="3" fill="rgba(201,166,107,0.95)" />
              <text x="0" y="-14" fontFamily='"JetBrains Mono", monospace' fontSize="9"
                fill="rgba(239,234,224,0.7)" textAnchor="middle" letterSpacing="1">
                {route.toIata}
              </text>
            </g>
            {mapAnimations && (
              <g style={{ filter: 'drop-shadow(0 0 6px rgba(201,166,107,0.7))' }}>
                <g transform="translate(-7,-7)">
                  <path
                    d="M 7 0 L 9 6 L 14 6 L 11 8 L 13 13 L 7 10 L 1 13 L 3 8 L 0 6 L 5 6 Z"
                    fill="rgba(201,166,107,0.95)"
                  />
                </g>
                <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#corridor-path" />
                </animateMotion>
              </g>
            )}
          </g>
        )}
      </svg>
    </motion.div>
  );
}
