import { AnimatePresence, motion } from 'framer-motion';
import { useFlightStore } from '../state/useFlightStore.js';
import { EASE } from '../lib/motion.js';

export default function Toast() {
  const toast = useFlightStore(s => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.t}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]
                     glass-strong rounded-full px-5 py-3 text-[13px] font-serif italic text-ink"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: EASE.outExpo }}
        >
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
