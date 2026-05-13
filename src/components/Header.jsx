// Site header — brand + minimal nav + customize.

import { useFlightStore } from '../state/useFlightStore.js';
import SettingsDrawer from './SettingsDrawer.jsx';

export default function Header() {
  const scene = useFlightStore(s => s.scene);
  const setScene = useFlightStore(s => s.setScene);
  const trips = useFlightStore(s => s.trips);

  const onTrips = scene === 'trips';
  const onSearch = scene === 'idle' || scene === 'search' || scene === 'results';

  return (
    <header className="fixed top-[44px] inset-x-0 z-40 px-6 py-3 flex items-center justify-between pointer-events-none">
      <button
        onClick={() => setScene('idle')}
        className="font-serif text-[18px] tracking-[0.32em] uppercase text-ink inline-flex items-center pointer-events-auto"
        aria-label="ATLAS home"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent mr-3.5 animate-pulse-dot
                         shadow-[0_0_18px_rgba(201,166,107,0.6)]" />
        ATLAS
      </button>

      <nav className="flex items-center gap-7 font-mono text-[11px] tracking-mono-wide uppercase text-ink-2 pointer-events-auto">
        <button
          onClick={() => setScene('idle')}
          className={`transition-colors ${onSearch ? 'text-accent' : 'hover:text-ink'}`}
        >
          Flights
        </button>
        <button
          onClick={() => setScene('trips')}
          className={`transition-colors ${onTrips ? 'text-accent' : 'hover:text-ink'}`}
        >
          Trips {trips.length > 0 && <span className="text-ink-3 ml-1">{trips.length}</span>}
        </button>
        <SettingsDrawer />
      </nav>
    </header>
  );
}
