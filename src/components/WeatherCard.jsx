// Route weather summary — departure / arrival / turbulence / seasonal note.

import { useMemo } from 'react';
import { weatherFor } from '../lib/weather.js';
import { getAirportByIata } from '../lib/airports.js';

export default function WeatherCard({ query }) {
  const data = useMemo(() => {
    const from = getAirportByIata(query.from);
    const to = getAirportByIata(query.to);
    if (!from || !to) return null;
    return { from, to, ...weatherFor(from, to, query.depart) };
  }, [query.from, query.to, query.depart]);

  if (!data) return null;

  const turbColor = data.turb.level === 'low' ? 'text-good'
    : data.turb.level === 'medium' ? 'text-warn' : 'text-bad';

  return (
    <div className="bg-bg-1/60 border border-ink/[0.06] rounded-lg p-4">
      <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase mb-3">
        Route conditions · {data.from.iata} → {data.to.iata}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <WeatherCol label={`Depart · ${data.from.city}`} w={data.dep} />
        <WeatherCol label={`Arrive · ${data.to.city}`}   w={data.arr} />
      </div>
      <div className="flex items-baseline justify-between border-t border-ink/[0.06] pt-3">
        <div>
          <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase">Turbulence</div>
          <div className={`font-serif text-[15px] ${turbColor}`}>{data.turb.label}</div>
        </div>
        <div className="font-serif italic text-[12px] text-ink-2 text-right max-w-[60%]">
          {data.turb.summary}
        </div>
      </div>
      <div className="font-serif italic text-[12px] text-ink-3 mt-2">
        {data.seasonalNote}
      </div>
    </div>
  );
}

function WeatherCol({ label, w }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] leading-none text-accent">{w.icon}</span>
        <div>
          <div className="font-serif text-[18px] text-ink">{w.temp}°</div>
          <div className="text-[11px] text-ink-2">{w.label}</div>
        </div>
      </div>
    </div>
  );
}
