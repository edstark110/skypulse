// Direct vs Connecting tradeoff summary for the result set.

import { directVsConnecting } from '../lib/intelligence.js';
import { fmtPrice, fmtDuration } from '../lib/util.js';
import { useFlightStore } from '../state/useFlightStore.js';

export default function DirectVsConnecting({ all }) {
  const currency = useFlightStore(s => s.settings.currency);
  const data = directVsConnecting(all);
  if (!data) return null;

  return (
    <div className="bg-bg-1/60 border border-ink/[0.06] rounded-lg p-4">
      <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase mb-3">
        Direct vs Connecting
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Side
          label="Direct"
          price={data.cheapestDirect.price}
          dur={data.cheapestDirect.durMins}
          rel={data.directReliability}
          airline={data.cheapestDirect.airline.name}
          currency={currency}
        />
        <Side
          label="Connecting"
          price={data.cheapestStop.price}
          dur={data.cheapestStop.durMins}
          rel={data.stopReliability}
          airline={data.cheapestStop.airline.name}
          stops={data.cheapestStop.stops}
          currency={currency}
        />
      </div>
      <div className="mt-3 pt-3 border-t border-ink/[0.06] text-[12px] text-ink-2">
        <span className="font-serif italic">
          {data.priceDelta > 0
            ? `Direct costs ${fmtPrice(data.priceDelta, currency)} more, saves ${fmtDuration(data.timeDelta)}.`
            : `Direct is cheaper by ${fmtPrice(-data.priceDelta, currency)} and saves ${fmtDuration(data.timeDelta)}.`}
        </span>
      </div>
    </div>
  );
}

function Side({ label, price, dur, rel, airline, stops, currency }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-ink-3 tracking-mono-wide uppercase mb-1">
        {label}{stops ? ` · ${stops} stop${stops > 1 ? 's' : ''}` : ''}
      </div>
      <div className="font-serif text-[20px] text-ink">{fmtPrice(price, currency)}</div>
      <div className="text-[12px] text-ink-2 mt-0.5">{fmtDuration(dur)} · {airline}</div>
      <div className="text-[11px] text-ink-3 mt-0.5">Reliability avg {rel}/10</div>
    </div>
  );
}
