// Compact, decision-first flight card with progressive disclosure.

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { fmtPrice, fmtDuration, fmtTime } from '../lib/util.js';
import { buildProsAndCons } from '../lib/intelligence.js';
import { bookingUrl } from '../lib/booking.js';
import { EASE } from '../lib/motion.js';
import PricingInsight from './PricingInsight.jsx';
import AircraftSchematic from './AircraftSchematic.jsx';
import WeatherCard from './WeatherCard.jsx';

export default function FlightCard({ result, all, index = 0, recommendation }) {
  const selectedId = useFlightStore(s => s.selectedId);
  const expandedId = useFlightStore(s => s.expandedId);
  const select = useFlightStore(s => s.selectFlight);
  const toggleExpand = useFlightStore(s => s.toggleExpand);
  const saveTrip = useFlightStore(s => s.saveTrip);
  const showToast = useFlightStore(s => s.showToast);
  const query = useFlightStore(s => s.query);
  const settings = useFlightStore(s => s.settings);

  const isOpen = expandedId === result.id;
  const isSelected = selectedId === result.id;
  const stopsLabel = result.stops === 0 ? 'Nonstop'
    : result.stops === 1 ? '1 stop' : `${result.stops} stops`;

  const pc = buildProsAndCons(result, all);
  const showVerbose = settings.verbosity !== 'minimal';
  const showDetailed = settings.verbosity === 'detailed';
  const density = settings.density;
  const cardPad = density === 'compact' ? 'p-3' : density === 'expanded' ? 'p-5' : 'p-4';

  function onClick() {
    select(result.id);
    toggleExpand(result.id);
  }

  function save(e) {
    e.stopPropagation();
    const ok = saveTrip(result);
    showToast(ok ? 'Saved to Trips' : 'Already saved');
  }

  const riskLabel = { low: 'Low risk', medium: 'Some risk', high: 'Higher risk' }[result.delayRisk];
  const riskColor = { low: 'text-good', medium: 'text-warn', high: 'text-bad' }[result.delayRisk];

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE.outExpo, delay: index * 0.05 }}
      className={`${cardPad} rounded-xl border cursor-pointer transition-all duration-200 ease-out-expo
                  ${isSelected
                    ? 'bg-accent/[0.06] border-accent/60'
                    : 'bg-surface/50 border-ink/[0.06] hover:border-ink/[0.14] hover:bg-surface-2/60'}`}
    >
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[13px] text-ink-2 inline-flex items-center gap-2">
          <span className="pill bg-accent/10 text-accent !text-[10px]">{result.airline.code}</span>
          {result.airline.name}
        </span>
        <span className="font-serif text-[22px] text-ink">{fmtPrice(result.price, settings.currency)}</span>
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-serif text-[19px] text-ink">{fmtTime(result.depMins)}</span>
        <span className="text-ink-3">→</span>
        <span className="font-serif text-[19px] text-ink">{fmtTime(result.arrMins)}</span>
        {result.arrMins >= 24 * 60 && (
          <span className="font-mono text-[10px] text-ink-3">+1</span>
        )}
        <span className="font-mono text-[11px] text-ink-3 ml-auto">{fmtDuration(result.durMins)}</span>
      </div>

      <div className="flex gap-3 text-[11px] text-ink-3 items-center flex-wrap">
        <span className={result.stops === 0 ? 'text-good' : 'text-ink-2'}>{stopsLabel}</span>
        <span className="font-mono tracking-wider">{result.aircraftCode}</span>
        <span className={`pill border border-ink/[0.14] bg-ink/[0.04] !text-[9px] ${riskColor}`}>
          {riskLabel}
        </span>
        <span className="pill border border-accent/30 bg-accent/10 text-accent !text-[9px]">
          ATLAS {result.atlasScore}/10
        </span>
        {recommendation && (
          <span className="pill border border-good/30 bg-good/10 text-good !text-[9px]">
            {recommendation}
          </span>
        )}
        <PricingInsight result={result} all={all} compact />
      </div>

      {showVerbose && (pc.pros.length > 0 || pc.cons.length > 0) && (
        <div className="mt-3 pt-3 border-t border-dashed border-ink/[0.06] flex flex-col gap-1">
          {pc.pros.map((p, i) => (
            <div key={`p${i}`} className="flex gap-2 items-baseline text-[12px] text-ink-2">
              <span className="font-mono text-good text-[9px] w-3.5 shrink-0">+</span>{p}
            </div>
          ))}
          {pc.cons.map((c, i) => (
            <div key={`c${i}`} className="flex gap-2 items-baseline text-[12px] text-ink-2">
              <span className="font-mono text-warn text-[9px] w-3.5 shrink-0">−</span>{c}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: EASE.outExpo }}
          className="mt-3 pt-3 border-t border-ink/[0.06] overflow-hidden"
        >
          {/* Segments */}
          <div className="mb-3">
            {result.segments.map((s, i) => (
              <div key={i}>
                <div className="grid grid-cols-[70px_1fr_auto] gap-3 py-2 border-b border-ink/[0.04] last:border-b-0 items-center text-[12px]">
                  <div className="font-mono text-[11px] text-ink-3">{s.flightNum}</div>
                  <div className="text-ink-2">
                    <strong className="text-ink font-medium">{fmtTime(s.depMins)} {s.from}</strong>
                    {' '}→{' '}
                    <strong className="text-ink font-medium">{fmtTime(s.arrMins)} {s.to}</strong>
                  </div>
                  <div className="font-mono text-[11px] text-ink-3">{fmtDuration(s.durMins)}</div>
                </div>
                {i < result.segments.length - 1 && (
                  <div className="text-center font-mono text-[10px] text-warn bg-warn/[0.06] border border-warn/20 rounded my-1.5 py-1 tracking-wider">
                    Layover · {s.to} · {fmtDuration(result.segments[i + 1].depMins - s.arrMins)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showDetailed && (
            <div className="space-y-3">
              <AircraftSchematic aircraftCode={result.aircraftCode} />
              <WeatherCard query={query} />
              <PricingInsight result={result} all={all} />
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button onClick={save} className="btn-soft flex-1">Save</button>
            <a
              href={bookingUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-primary flex-1 !text-xs"
            >
              Book on Google Flights →
            </a>
          </div>
        </motion.div>
      )}
    </motion.article>
  );
}
