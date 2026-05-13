// Lightweight aircraft fuselage schematic with seat zones.
// Honest framing: shows known best/worst zones for an aircraft family — no live seat-map.

import { seatPlan } from '../lib/seating.js';

export default function AircraftSchematic({ aircraftCode }) {
  const plan = seatPlan(aircraftCode);
  if (!plan) return null;

  // Render rows compressed (each row = 1px equivalent), wings + exits marked.
  const W = 320, H = 88;
  const fuselagePad = 24;
  const fuselageW = W - fuselagePad * 2;
  const rowW = fuselageW / plan.rows;

  // Zones
  const bestRanges  = compressRanges(plan.bestRows);
  const worstRanges = compressRanges(plan.worstRows);

  return (
    <div className="bg-bg-1/60 border border-ink/[0.06] rounded-lg p-4">
      <div className="flex justify-between items-baseline mb-3">
        <div className="font-serif text-[15px] text-ink">{plan.label}</div>
        <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase">
          {plan.layout} · {plan.rows} rows
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Fuselage outline */}
        <rect
          x={fuselagePad - 6} y={H/2 - 14} width={fuselageW + 12} height={28}
          rx={14} ry={14}
          fill="rgba(239,234,224,0.04)"
          stroke="rgba(239,234,224,0.16)"
          strokeWidth="0.6"
        />
        {/* Nose hint */}
        <path
          d={`M ${fuselagePad - 6} ${H/2 - 4} Q ${fuselagePad - 14} ${H/2} ${fuselagePad - 6} ${H/2 + 4}`}
          fill="rgba(239,234,224,0.04)"
          stroke="rgba(239,234,224,0.16)" strokeWidth="0.6"
        />
        {/* Tail hint */}
        <path
          d={`M ${fuselagePad + fuselageW + 6} ${H/2 - 8}
              L ${fuselagePad + fuselageW + 18} ${H/2 - 16}
              L ${fuselagePad + fuselageW + 14} ${H/2}
              L ${fuselagePad + fuselageW + 18} ${H/2 + 16}
              L ${fuselagePad + fuselageW + 6} ${H/2 + 8} Z`}
          fill="rgba(239,234,224,0.06)"
          stroke="rgba(239,234,224,0.16)" strokeWidth="0.6"
        />
        {/* Wing band */}
        <rect
          x={fuselagePad + plan.wing[0] * rowW}
          y={H/2 - 24}
          width={(plan.wing[1] - plan.wing[0]) * rowW}
          height={48}
          fill="rgba(201,166,107,0.08)"
          stroke="rgba(201,166,107,0.22)"
          strokeWidth="0.4"
          strokeDasharray="2,2"
          rx="2"
        />
        {/* Best zones */}
        {bestRanges.map((r, i) => (
          <rect
            key={`best-${i}`}
            x={fuselagePad + r[0] * rowW} y={H/2 - 10}
            width={(r[1] - r[0] + 1) * rowW} height={20}
            fill="rgba(141,197,160,0.16)" stroke="rgba(141,197,160,0.45)" strokeWidth="0.4" rx="2"
          />
        ))}
        {/* Worst zones */}
        {worstRanges.map((r, i) => (
          <rect
            key={`worst-${i}`}
            x={fuselagePad + r[0] * rowW} y={H/2 - 10}
            width={(r[1] - r[0] + 1) * rowW} height={20}
            fill="rgba(216,136,132,0.12)" stroke="rgba(216,136,132,0.40)" strokeWidth="0.4" rx="2"
          />
        ))}
        {/* Exits */}
        {plan.exits.map((ex, i) => (
          <g key={i}>
            <line
              x1={fuselagePad + ex * rowW} y1={H/2 - 14}
              x2={fuselagePad + ex * rowW} y2={H/2 + 14}
              stroke="rgba(201,166,107,0.85)" strokeWidth="0.8" strokeDasharray="1.5,1.5"
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-mono tracking-mono-wide uppercase">
        <span className="flex items-center gap-1.5 text-ink-2">
          <i className="w-2.5 h-2.5 rounded-sm bg-good/30 border border-good/60" /> Best zones
        </span>
        <span className="flex items-center gap-1.5 text-ink-2">
          <i className="w-2.5 h-2.5 rounded-sm bg-bad/30 border border-bad/60" /> Avoid
        </span>
        <span className="flex items-center gap-1.5 text-ink-2">
          <i className="w-2.5 h-2.5 rounded-sm bg-accent/15 border border-accent/40" /> Wing
        </span>
        <span className="flex items-center gap-1.5 text-ink-2">
          <i className="block w-0.5 h-3 bg-accent" /> Exit
        </span>
      </div>

      {/* Insights */}
      <ul className="mt-3 space-y-1.5">
        {plan.insights.map((s, i) => (
          <li key={i} className="text-[12px] text-ink-2 flex gap-2 items-baseline">
            <span className={`font-mono text-[9px] tracking-mono-wide uppercase pt-0.5
              ${s.kind === 'good' ? 'text-good' : s.kind === 'warn' ? 'text-warn' : 'text-ink-3'}`}>
              {s.kind === 'good' ? '+' : s.kind === 'warn' ? '!' : '·'}
            </span>
            {s.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function compressRanges(rows) {
  if (!rows.length) return [];
  const sorted = [...new Set(rows)].sort((a, b) => a - b);
  const out = [[sorted[0], sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    if (sorted[i] === last[1] + 1) last[1] = sorted[i];
    else out.push([sorted[i], sorted[i]]);
  }
  return out;
}
