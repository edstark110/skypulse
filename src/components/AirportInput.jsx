// Autocomplete input with ranked airport matching.

import { useEffect, useRef, useState } from 'react';
import { searchAirports, airportLabel } from '../lib/airports.js';

export default function AirportInput({ name, label, value, onChange, placeholder = 'City or airport' }) {
  const [text, setText] = useState(airportLabel(value));
  const [iata, setIata] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);

  useEffect(() => { setText(airportLabel(value)); setIata(value || ''); }, [value]);

  useEffect(() => {
    function handler(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function refresh(v) {
    const list = searchAirports(v, 8);
    setMatches(list);
    setActive(-1);
    setOpen(!!list.length);
  }

  function pick(a) {
    setText(airportLabel(a.iata));
    setIata(a.iata);
    setOpen(false);
    onChange(a.iata);
  }

  function onKey(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(matches[active]); }
    else if (e.key === 'Escape')    { setOpen(false); }
  }

  return (
    <div ref={wrapRef} className="field-shell">
      <label>{label}</label>
      <input
        type="text"
        name={name}
        value={text}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setIata('');
          onChange('');
          refresh(e.target.value);
        }}
        onFocus={() => text && refresh(text)}
        onKeyDown={onKey}
      />
      {open && matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-[280px] overflow-y-auto
                        rounded-lg glass-strong shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          {matches.map((a, i) => (
            <button
              key={a.iata}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(a); }}
              className={`w-full text-left px-4 py-2.5 border-b border-ink/[0.06] last:border-b-0
                          flex items-baseline gap-3 transition-colors duration-150
                          ${i === active ? 'bg-ink/[0.04]' : 'hover:bg-ink/[0.04]'}`}
            >
              <span className="font-mono text-[11px] text-accent tracking-wider min-w-[30px]">{a.iata}</span>
              <span className="text-ink text-[13px]">{a.city}</span>
              <span className="text-ink-3 text-[11px] ml-auto">{a.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
