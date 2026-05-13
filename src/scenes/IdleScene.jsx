// IDLE — globe centered, search centered, nothing else.

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import Globe from '../components/Globe.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { sceneTransition, revealUp } from '../lib/motion.js';

export default function IdleScene() {
  const settings = useFlightStore(s => s.settings);
  const setScene = useFlightStore(s => s.setScene);

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6"
      {...sceneTransition(settings.motion)}
    >
      <Globe />
      <div className="relative z-10 w-full max-w-3xl text-center">
        <motion.div className="font-mono text-[11px] tracking-mono-wider uppercase text-ink-3 mb-7"
          {...revealUp(settings.motion, 0.20)}>
          ATLAS · Flight Intelligence
        </motion.div>
        <motion.h1
          className="font-serif font-light text-[clamp(40px,6vw,76px)] leading-[1.04] tracking-[-0.025em] text-ink mb-3"
          {...revealUp(settings.motion, 0.36)}>
          Where would you like to <em className="text-accent-2 italic font-light">go</em>?
        </motion.h1>
        <motion.p className="font-serif italic text-[17px] text-ink-2 mb-12"
          {...revealUp(settings.motion, 0.52)}>
          Smarter flight decisions.
        </motion.p>
        <SearchBar onFocus={() => setScene('search')} />
        <motion.p className="mt-10 font-mono text-[11px] tracking-mono-wider uppercase text-ink-3"
          {...revealUp(settings.motion, 1.10)}>
          Compare by comfort, timing &amp; price · Find smarter routes, not just cheaper fares
        </motion.p>
      </div>
    </motion.section>
  );
}
