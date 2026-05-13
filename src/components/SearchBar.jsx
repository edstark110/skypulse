// ATLAS · the search instrument.
// Used in IdleScene + ResultsScene header. Subtle, calm, focused.

import { motion } from 'framer-motion';
import { useFlightStore, resolveIata } from '../state/useFlightStore.js';
import AirportInput from './AirportInput.jsx';
import { todayISO } from '../lib/util.js';
import { EASE } from '../lib/motion.js';
import { CURRENCIES } from '../lib/util.js';

export default function SearchBar({ compact = false, onFocus }) {
  const query = useFlightStore(s => s.query);
  const setQuery = useFlightStore(s => s.setQuery);
  const runSearch = useFlightStore(s => s.runSearch);
  const showToast = useFlightStore(s => s.showToast);
  const settings = useFlightStore(s => s.settings);
  const updateSettings = useFlightStore(s => s.updateSettings);

  const isRound = query.tripType === 'round';

  function handleSubmit(e) {
    e.preventDefault();
    const from = query.from || resolveIata(e.target.from.value);
    const to = query.to   || resolveIata(e.target.to.value);
    if (!from) { showToast('Pick an origin airport'); return; }
    if (!to)   { showToast('Pick a destination airport'); return; }
    if (from === to) { showToast('Origin and destination must differ'); return; }
    runSearch({ from, to });
  }

  function swap() {
    setQuery({ from: query.to, to: query.from });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      onFocusCapture={onFocus}
      className={`glass rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]
                  ${compact ? 'p-3' : 'p-5'} w-full`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE.outExpo, delay: 0.7 }}
    >
      <div className={`grid gap-2 items-stretch
        ${isRound
          ? 'grid-cols-[1.2fr_0.05fr_1.2fr_1fr_1fr]'
          : 'grid-cols-[1.2fr_0.05fr_1.2fr_1fr]'}
        max-md:!grid-cols-2 max-md:!gap-2`}>
        <AirportInput
          name="from" label="From"
          value={query.from}
          onChange={(iata) => setQuery({ from: iata })}
        />
        <button
          type="button"
          onClick={swap}
          title="Swap"
          className="hidden md:flex items-center justify-center text-ink-3 text-lg
                     border border-ink/[0.06] rounded-lg bg-bg-1/40
                     transition-all duration-200 ease-out-expo
                     hover:text-accent hover:border-ink/[0.14] hover:rotate-180"
        >
          ⇄
        </button>
        <AirportInput
          name="to" label="To"
          value={query.to}
          onChange={(iata) => setQuery({ to: iata })}
        />
        <div className="field-shell">
          <label>Departure</label>
          <input
            type="date" name="depart"
            value={query.depart}
            min={todayISO(0)}
            onChange={(e) => {
              const v = e.target.value;
              const patch = { depart: v };
              if (isRound && query.ret < v) patch.ret = v;
              setQuery(patch);
            }}
            required
          />
        </div>
        {isRound && (
          <div className="field-shell">
            <label>Return</label>
            <input
              type="date" name="ret"
              value={query.ret}
              min={query.depart}
              onChange={(e) => setQuery({ ret: e.target.value })}
              required
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 gap-3 flex-wrap">
        <div className="flex gap-1 bg-bg-1/50 border border-ink/[0.06] p-0.5 rounded-full">
          <button
            type="button"
            onClick={() => setQuery({ tripType: 'round' })}
            className={`px-4 py-1.5 font-mono text-[10px] tracking-mono-wide uppercase rounded-full
              transition-colors duration-200 ${
                isRound ? 'bg-ink text-bg' : 'text-ink-3 hover:text-ink-2'
              }`}
          >Round trip</button>
          <button
            type="button"
            onClick={() => setQuery({ tripType: 'one' })}
            className={`px-4 py-1.5 font-mono text-[10px] tracking-mono-wide uppercase rounded-full
              transition-colors duration-200 ${
                !isRound ? 'bg-ink text-bg' : 'text-ink-3 hover:text-ink-2'
              }`}
          >One way</button>
        </div>
        <div className="flex items-stretch gap-2 flex-wrap">
          <div className="field-shell !py-2 !px-3">
            <label>Travelers</label>
            <select
              value={query.pax}
              onChange={(e) => setQuery({ pax: parseInt(e.target.value, 10) })}
            >
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field-shell !py-2 !px-3">
            <label>Cabin</label>
            <select
              value={query.cabin}
              onChange={(e) => setQuery({ cabin: e.target.value })}
            >
              {['Economy','Premium Economy','Business','First'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field-shell !py-2 !px-3">
            <label>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
            >
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Search Flights <span className="ml-1">→</span>
          </button>
        </div>
      </div>
    </motion.form>
  );
}
