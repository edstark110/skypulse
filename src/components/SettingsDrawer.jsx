// Customization layer — motion intensity, density, intelligence verbosity, map animations, currency.

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useFlightStore } from '../state/useFlightStore.js';
import { CURRENCIES } from '../lib/util.js';
import { EASE } from '../lib/motion.js';

export default function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const settings = useFlightStore(s => s.settings);
  const update = useFlightStore(s => s.updateSettings);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="label-mono hover:text-ink transition-colors"
        title="Customize ATLAS"
      >
        Customize
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog" aria-label="Customize"
              className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-[400px] glass-strong border-l border-ink/[0.14] p-6 overflow-y-auto"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.55, ease: EASE.outExpo }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-[22px] font-light tracking-tight">Customize</h2>
                <button onClick={() => setOpen(false)} className="label-mono hover:text-ink">Close</button>
              </div>

              <Section title="Motion intensity"
                desc="Controls how much the interface animates. Low keeps things still; High adds the cinematic feel.">
                <Segmented value={settings.motion} onChange={v => update({ motion: v })}
                  options={[['low','Low'],['medium','Medium'],['high','High']]} />
              </Section>

              <Section title="Density"
                desc="Compact packs more flights per screen. Expanded gives each card breathing room.">
                <Segmented value={settings.density} onChange={v => update({ density: v })}
                  options={[['compact','Compact'],['standard','Standard'],['expanded','Expanded']]} />
              </Section>

              <Section title="Intelligence verbosity"
                desc="Minimal hides pros/cons and detail. Detailed reveals aircraft schematic + weather inline.">
                <Segmented value={settings.verbosity} onChange={v => update({ verbosity: v })}
                  options={[['minimal','Minimal'],['standard','Standard'],['detailed','Detailed']]} />
              </Section>

              <Section title="Map animations"
                desc="The single aircraft circling the globe (decorative). Disable to keep things still.">
                <Segmented value={String(settings.mapAnimations)} onChange={v => update({ mapAnimations: v === 'true' })}
                  options={[['true','On'],['false','Off']]} />
              </Section>

              <Section title="Currency"
                desc="Display fares in this currency. Conversion via static rates — not live.">
                <select
                  value={settings.currency}
                  onChange={(e) => update({ currency: e.target.value })}
                  className="w-full bg-bg-1/60 border border-ink/[0.14] rounded-lg px-3 py-2 text-ink"
                >
                  {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Section>

              <div className="mt-8 pt-4 border-t border-ink/[0.06] font-serif italic text-[12px] text-ink-3">
                Default values are always clean, minimal, and trusted. Changes save automatically.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] tracking-mono-wide uppercase text-ink-3 mb-1.5">{title}</div>
      <div className="mb-2.5">{children}</div>
      <p className="text-[12px] text-ink-3 leading-snug">{desc}</p>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex gap-0.5 bg-bg-1/50 border border-ink/[0.06] p-0.5 rounded-full">
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 px-3 py-1.5 font-mono text-[10px] tracking-mono-wide uppercase rounded-full
            transition-colors duration-200 ${
              value === v ? 'bg-accent text-bg font-medium' : 'text-ink-3 hover:text-ink-2'
            }`}
        >{l}</button>
      ))}
    </div>
  );
}
