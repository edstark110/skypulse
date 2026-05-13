// Flight list — sort tabs, count, cards. Uses sortedResults + filteredResults from store.

import { useMemo, useState } from 'react';
import { useFlightStore } from '../state/useFlightStore.js';
import { applyFilters, sortResults } from '../lib/results.js';
import FlightCard from './FlightCard.jsx';
import FilterPanel from './FilterPanel.jsx';
import DirectVsConnecting from './DirectVsConnecting.jsx';

const SORT_OPTIONS = [
  ['best',    'Best'],
  ['cheap',   'Cheapest'],
  ['fast',    'Fastest'],
  ['comfort', 'Comfort'],
  ['risk',    'Low risk'],
];

export default function FlightList() {
  const results = useFlightStore(s => s.results);
  const filters = useFlightStore(s => s.filters);
  const sort    = useFlightStore(s => s.sort);
  const setSort = useFlightStore(s => s.setSort);
  const [showFilters, setShowFilters] = useState(false);

  const sorted = useMemo(
    () => sortResults(applyFilters(results, filters), sort),
    [results, filters, sort]
  );
  const ctx = useMemo(() => ({
    cheapest:    Math.min(...results.map(r => r.price)),
    fastest:     Math.min(...results.map(r => r.durMins)),
    bestQuality: Math.max(...results.map(r => r.quality)),
    bestComfort: Math.max(...results.map(r => r.comfort)),
  }), [results]);

  function recommendationFor(r) {
    if (r.price === ctx.cheapest && r.durMins === ctx.fastest) return '★ ATLAS Pick';
    if (r.price === ctx.cheapest) return '▾ Lowest fare';
    if (r.durMins === ctx.fastest) return '▴ Fastest';
    if (r.comfort === ctx.bestComfort && r.comfort >= 9) return '◆ Most comfort';
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 bg-bg-1/50 border border-ink/[0.06] p-0.5 rounded-full">
          {SORT_OPTIONS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-mono-wide uppercase rounded-full
                transition-colors duration-200 ${
                  sort === k ? 'bg-accent text-bg font-medium' : 'text-ink-3 hover:text-ink-2'
                }`}
            >{l}</button>
          ))}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="btn-soft !text-[11px] !py-1.5 !px-3"
        >
          {showFilters ? 'Hide filters' : 'Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-ink/[0.06] bg-surface/30 p-4">
          <FilterPanel />
        </div>
      )}

      <DirectVsConnecting all={results} />

      <div className="label-mono pt-2">
        {sorted.length} of {results.length} options
      </div>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-10 text-ink-3">
            <div className="font-serif italic text-[18px] mb-2">No flights match these filters.</div>
            <div className="text-[12px]">Try widening stops, airlines, or max price.</div>
          </div>
        ) : sorted.map((r, i) => (
          <FlightCard
            key={r.id}
            result={r}
            all={results}
            index={i}
            recommendation={recommendationFor(r)}
          />
        ))}
      </div>
    </div>
  );
}
