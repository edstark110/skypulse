// Saved trips list.

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { getAirportByIata } from '../lib/airports.js';
import { fmtPrice, fmtDuration, fmtDate } from '../lib/util.js';
import { sceneTransition } from '../lib/motion.js';

export default function TripsScene() {
  const settings = useFlightStore(s => s.settings);
  const trips = useFlightStore(s => s.trips);
  const removeTrip = useFlightStore(s => s.removeTrip);
  const setScene = useFlightStore(s => s.setScene);
  const runSearch = useFlightStore(s => s.runSearch);
  const setQuery = useFlightStore(s => s.setQuery);

  function searchAgain(t) {
    setQuery(t.query);
    runSearch(t.query);
  }

  return (
    <motion.section
      className="pt-36 pb-20 px-6 max-w-[920px] mx-auto"
      {...sceneTransition(settings.motion)}
    >
      <motion.h1
        className="font-serif font-light text-[48px] tracking-tight mb-9"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >Saved trips</motion.h1>

      {trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="font-serif italic text-[22px] text-ink-2 mb-2">No trips saved yet.</div>
          <div className="text-[13px] text-ink-3 mb-6">
            Save a flight while comparing options and it will appear here.
          </div>
          <button onClick={() => setScene('idle')} className="btn-primary">
            Start searching →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {trips.map((t, i) => {
            const fromA = getAirportByIata(t.query.from);
            const toA   = getAirportByIata(t.query.to);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-surface/55 border border-ink/[0.06] rounded-xl px-5 py-4 grid grid-cols-[1fr_auto] gap-4 items-center"
              >
                <div>
                  <div className="font-serif text-[22px] font-light tracking-tight">
                    {fromA ? fromA.city : t.query.from} → {toA ? toA.city : t.query.to}
                  </div>
                  <div className="text-[12px] text-ink-3 mt-1">
                    {t.snapshot.airlineName} · {t.snapshot.aircraftCode} ·{' '}
                    {fmtPrice(t.snapshot.price, settings.currency)} ·{' '}
                    {fmtDuration(t.snapshot.durMins)} ·{' '}
                    {t.snapshot.stops === 0 ? 'Nonstop' : `${t.snapshot.stops} stop${t.snapshot.stops > 1 ? 's' : ''}`} ·{' '}
                    ATLAS {t.snapshot.atlasScore}/10 ·{' '}
                    {fmtDate(t.query.depart)}
                    {t.query.tripType === 'round' && t.query.ret && ` – ${fmtDate(t.query.ret)}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-soft" onClick={() => searchAgain(t)}>Search again</button>
                  <button className="btn-soft" onClick={() => removeTrip(t.id)}>Remove</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
