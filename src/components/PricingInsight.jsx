// Pricing intelligence pill — "Below typical", "Stable", "Above typical".
// Drawn from result data, never fake urgency.

import { pricingInsight } from '../lib/intelligence.js';

export default function PricingInsight({ result, all, compact = false }) {
  const ins = pricingInsight(result, all);
  if (!ins) return null;
  const palette = {
    good:    'text-good   bg-good/10   border-good/30',
    warn:    'text-warn   bg-warn/10   border-warn/30',
    neutral: 'text-ink-2  bg-ink/[0.05] border-ink/[0.14]',
  }[ins.tone];

  if (compact) {
    return (
      <span className={`pill border ${palette} !text-[9px]`}>
        {ins.label}
      </span>
    );
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${palette}`}>
      <div className="font-mono text-[10px] tracking-mono-wide uppercase">{ins.label}</div>
      <div className="font-serif italic text-[12px] mt-1 opacity-80">{ins.detail}</div>
    </div>
  );
}
