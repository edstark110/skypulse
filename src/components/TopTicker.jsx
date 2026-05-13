// Rotating aviation truisms — editorial, no fake live telemetry.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '../lib/motion.js';

const FIELD_NOTES = [
  'Tuesday and Wednesday typically post the lowest economy fares.',
  'Booking four to eight weeks before departure tends to yield the best price.',
  'Morning departures historically run with fewer cascading delays.',
  'Long-haul nonstop routes show the highest punctuality in mid-week.',
  'Premium-cabin upgrades cluster within seventy-two hours of departure.',
  'Aisle seats over the wing run quieter on most narrow-body aircraft.',
  'Returning Tuesday or Wednesday tends to lower the round-trip total.',
  'Short layovers between forty-five and ninety minutes carry the highest miss risk.',
  'Red-eye flights west-to-east compound jet lag; east-to-west softens it.',
  'Window seats on the south-facing side stay shaded on most equatorial routes.',
];

export default function TopTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % FIELD_NOTES.length), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-50 px-6 py-2.5 flex items-center justify-center gap-3
                    glass-strong border-b border-ink/[0.06] text-[12px] overflow-hidden">
      <span className="pill border border-accent/30 text-accent !text-[10px]">
        Field Note
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          className="font-serif italic text-ink text-[14px] text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.6, ease: EASE.outExpo }}
        >
          {FIELD_NOTES[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
