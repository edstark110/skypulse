// Lightweight filter rail. Lives inline above the result list (not modal).

import { useMemo } from 'react';
import { useFlightStore } from '../state/useFlightStore.js';
import { fmtPrice } from '../lib/util.js';

export default function FilterPanel() {
  const filters = useFlightStore(s => s.filters);
  const results = useFlightStore(s => s.results);
  const setFilter = useFlightStore(s => s.setFilter);
  const resetFilters = useFlightStore(s => s.resetFilters);
  const currency = useFlightStore(s => s.settings.currency);

  const { stopsCount, airlineCount, minPrice, maxPrice } = useMemo(() => {
    const sc = { '0':0, '1':0, '2':0 };
    const ac = {};
    let lo = Infinity, hi = 0;
    results.forEach(r => {
      sc[String(r.stops)] = (sc[String(r.stops)] || 0) + 1;
      ac[r.airline.code] = (ac[r.airline.code] || 0) + 1;
      if (r.price < lo) lo = r.price;
      if (r.price > hi) hi = r.price;
    });
    if (lo === Infinity) lo = 0;
    return { stopsCount: sc, airlineCount: ac, minPrice: lo, maxPrice: hi };
  }, [results]);

  const cur = filters.maxPrice == null ? maxPrice : filters.maxPrice;

  function toggleSetMember(setName, value) {
    const next = new Set(filters[setName]);
    if (next.has(value)) next.delete(value); else next.add(value);
    setFilter({ [setName]: next });
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center justify-between">
        <span className="label-mono">Filters</span>
        <button onClick={resetFilters} className="label-mono hover:text-ink transition-colors">
          Reset
        </button>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-ink-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.directOnly}
          onChange={(e) => setFilter({ directOnly: e.target.checked })}
          className="accent-accent"
        />
        Direct only
      </label>

      {!filters.directOnly && (
        <div>
          <div className="label-mono mb-1.5">Stops</div>
          {[['0','Nonstop'], ['1','1 stop'], ['2','2+ stops']].map(([v, l]) => (
            <label key={v} className="flex items-center justify-between text-[12px] text-ink-2 py-0.5 cursor-pointer hover:text-ink">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.stops.has(v)}
                  onChange={() => toggleSetMember('stops', v)}
                  className="accent-accent"
                />
                {l}
              </span>
              <span className="font-mono text-[11px] text-ink-3">{stopsCount[v] || 0}</span>
            </label>
          ))}
        </div>
      )}

      <div>
        <div className="label-mono mb-1.5">Max price</div>
        <input
          type="range"
          min={minPrice} max={maxPrice} step="10"
          value={cur}
          onChange={(e) => setFilter({ maxPrice: parseInt(e.target.value, 10) })}
          className="w-full accent-accent"
        />
        <div className="flex justify-between font-mono text-[10px] text-ink-3 mt-1">
          <span>{fmtPrice(minPrice, currency)}</span>
          <span>{fmtPrice(cur, currency)}</span>
        </div>
      </div>

      <div>
        <div className="label-mono mb-1.5">Departure</div>
        {[
          ['any','Any time'],
          ['morning','Morning (5–12)'],
          ['afternoon','Afternoon (12–17)'],
          ['evening','Evening (17–22)'],
          ['night','Night (22–5)'],
        ].map(([v, l]) => (
          <label key={v} className="flex items-center gap-2 text-[12px] text-ink-2 py-0.5 cursor-pointer hover:text-ink">
            <input
              type="radio" name="dw" value={v}
              checked={filters.departWindow === v}
              onChange={() => setFilter({ departWindow: v })}
              className="accent-accent"
            />
            {l}
          </label>
        ))}
      </div>

      <div>
        <div className="label-mono mb-1.5">Airlines</div>
        {Object.keys(airlineCount).sort().map(code => {
          const checked = filters.airlines.size === 0 || filters.airlines.has(code);
          return (
            <label key={code} className="flex items-center justify-between text-[12px] text-ink-2 py-0.5 cursor-pointer hover:text-ink">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    let next = new Set(filters.airlines);
                    if (next.size === 0) {
                      // initialize with all visible airlines, then toggle this one off
                      results.forEach(r => next.add(r.airline.code));
                    }
                    if (next.has(code)) next.delete(code); else next.add(code);
                    setFilter({ airlines: next });
                  }}
                  className="accent-accent"
                />
                {code}
              </span>
              <span className="font-mono text-[11px] text-ink-3">{airlineCount[code]}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
