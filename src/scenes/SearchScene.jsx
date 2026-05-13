// SEARCH — same layout as idle, but globe softens to focus mode.
// (Visually nearly identical; provides the "focus" intermediate state.)

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import Globe from '../components/Globe.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { sceneTransition, revealUp } from '../lib/motion.js';

export default function SearchScene() {
  const settings = useFlightStore(s => s.settings);

  return (
    <motion.section
      className="relative min-h-screen flex items-start justify-center pt-32 pb-20 px-6"
      {...sceneTransition(settings.motion)}
    >
      <Globe focusMode />
      <div className="relative z-10 w-full max-w-3xl">
        <motion.div className="text-center mb-6 font-mono text-[11px] tracking-mono-wider uppercase text-ink-3"
          {...revealUp(settings.motion, 0)}>
          Focused search
        </motion.div>
        <SearchBar />
      </div>
    </motion.section>
  );
}
