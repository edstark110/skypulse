// IDLE — globe centered, search centered, nothing else.

import { motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import Globe from '../components/Globe.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { sceneTransition, revealUp } from '../lib/motion.js';

// Hero composition inspired by Studio Namma: bigger confident serif, slow stagger,
// generous (not bloated) spacing, search surface anchored just below the headline.

const WORDS = ['Where', 'would', 'you', 'like', 'to'];

export default function IdleScene() {
  const settings = useFlightStore(s => s.settings);

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16"
      {...sceneTransition(settings.motion)}
    >
      <Globe />
      <div className="relative z-10 w-full max-w-[940px] text-center">
        <motion.div
          className="font-mono text-[11px] tracking-mono-wider uppercase text-ink-3 mb-9"
          {...revealUp(settings.motion, 0.15)}
        >
          ATLAS · Flight Intelligence
        </motion.div>

        {/* Headline — word-level stagger, slow cinematic pacing */}
        <h1 className="font-serif font-light text-[clamp(52px,8.2vw,112px)]
                       leading-[0.98] tracking-[-0.035em] text-ink mb-5">
          <span className="block">
            {WORDS.map((w, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.30 + i * 0.07 }}
              >
                {w}&nbsp;
              </motion.span>
            ))}
          </span>
          <motion.span
            className="block italic text-accent-2 font-light"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
          >
            go?
          </motion.span>
        </h1>

        <motion.p
          className="font-serif italic text-[clamp(15px,1.4vw,19px)] text-ink-2 mb-10"
          {...revealUp(settings.motion, 1.05)}
        >
          The world is waiting.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.20 }}
        >
          <SearchBar />
        </motion.div>

        <motion.p
          className="mt-9 font-mono text-[11px] tracking-mono-wider uppercase text-ink-3"
          {...revealUp(settings.motion, 1.55)}
        >
          Compare by comfort, timing &amp; price · Find smarter routes, not just cheaper fares
        </motion.p>
      </div>
    </motion.section>
  );
}
