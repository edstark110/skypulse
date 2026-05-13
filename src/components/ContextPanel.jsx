// Bottom-right intelligence panel — fades on selection change.
// Pulls signals from real result data via lib/intelligence.

import { AnimatePresence, motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { contextSignal } from '../lib/intelligence.js';
import { EASE } from '../lib/motion.js';
import { useMemo } from 'react';

export default function ContextPanel() {
  const results = useFlightStore(s => s.results);
  const selectedId = useFlightStore(s => s.selectedId);
  const query = useFlightStore(s => s.query);
  const currency = useFlightStore(s => s.settings.currency);

  const selected = useMemo(
    () => results.find(r => r.id === selectedId),
    [results, selectedId]
  );

  const text = contextSignal(selected, results, query, currency);

  return (
    <motion.div
      className="absolute bottom-6 right-6 max-w-[360px] glass-strong rounded-xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.88, ease: EASE.outExpo, delay: 0.5 }}
    >
      <div className="font-mono text-[10px] tracking-mono-wide uppercase text-accent mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent,#C9A66B)]" />
        Field Reading
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId || 'empty'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.36, ease: EASE.outExpo }}
          className="font-serif italic text-[14px] leading-snug text-ink"
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
