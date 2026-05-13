// RESULTS — split: left rail (flight list) + right map + bottom-right context.

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import FlightList from '../components/FlightList.jsx';
import MapPanel from '../components/MapPanel.jsx';
import ContextPanel from '../components/ContextPanel.jsx';
import { sceneTransition, revealUp } from '../lib/motion.js';
import { getAirportByIata } from '../lib/airports.js';
import { fmtDate } from '../lib/util.js';

export default function ResultsScene() {
  const settings = useFlightStore(s => s.settings);
  const query = useFlightStore(s => s.query);
  const setScene = useFlightStore(s => s.setScene);

  const fromA = getAirportByIata(query.from);
  const toA   = getAirportByIata(query.to);

  return (
    <motion.section
      className="fixed inset-x-0 top-[96px] bottom-0 grid grid-cols-[480px_1fr] max-md:grid-cols-1"
      {...sceneTransition(settings.motion)}
    >
      <motion.aside
        className="border-r border-ink/[0.06] bg-bg/70 backdrop-blur-md overflow-y-auto px-6 py-6 max-md:max-h-[60vh]"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.88, ease: [0.16,1,0.3,1], delay: 0.2 }}
      >
        <button
          onClick={() => setScene('idle')}
          className="label-mono hover:text-ink transition-colors mb-3 inline-flex items-center gap-2"
        >
          ← New search
        </button>
        <motion.div className="font-serif text-[28px] font-light tracking-tight leading-tight text-ink"
          {...revealUp(settings.motion, 0.30)}>
          {fromA ? fromA.city : query.from}{' '}
          <span className="font-mono text-[12px] text-accent tracking-wider align-middle">{query.from}</span>{' '}→{' '}
          {toA ? toA.city : query.to}{' '}
          <span className="font-mono text-[12px] text-accent tracking-wider align-middle">{query.to}</span>
        </motion.div>
        <motion.div className="text-[12px] text-ink-3 mb-5"
          {...revealUp(settings.motion, 0.40)}>
          {fmtDate(query.depart)}
          {query.tripType === 'round' && query.ret && ` – ${fmtDate(query.ret)}`}
          {' · '}{query.pax} {query.pax === 1 ? 'traveler' : 'travelers'}{' · '}{query.cabin}
        </motion.div>

        <FlightList />
      </motion.aside>

      <div className="relative max-md:hidden">
        <MapPanel />
        <ContextPanel />
      </div>
    </motion.section>
  );
}
