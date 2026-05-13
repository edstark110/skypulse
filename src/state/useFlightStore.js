// ATLAS · global state
// Single Zustand store covering scene, query, results, filters, selection, settings.

import { create } from 'zustand';
import { generateResults, sortResults, applyFilters } from '../lib/results.js';
import { resolveIata } from '../lib/airports.js';
import { todayISO } from '../lib/util.js';

const SETTINGS_KEY = 'atlas:settings';
const TRIPS_KEY    = 'atlas:trips';

function loadSettings() {
  try {
    return Object.assign({
      motion: 'medium',          // low | medium | high
      density: 'standard',       // compact | standard | expanded
      verbosity: 'standard',     // minimal | standard | detailed
      currency: 'USD',
      mapAnimations: true,
    }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  } catch { return { motion:'medium', density:'standard', verbosity:'standard', currency:'USD', mapAnimations:true }; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]'); } catch { return []; }
}
function saveTrips(arr) { localStorage.setItem(TRIPS_KEY, JSON.stringify(arr)); }

export const useFlightStore = create((set, get) => ({
  // === scene ===
  // Only three scenes — no intermediate "search" state. The idle hero IS the
  // search surface; transitioning away mid-click was destroying form state.
  scene: 'idle',                // idle | results | trips
  setScene: (scene) => set({ scene }),

  // === query ===
  query: {
    from: '', to: '',
    depart: todayISO(14),
    ret:    todayISO(21),
    pax: 1,
    cabin: 'Economy',
    tripType: 'round',
  },
  setQuery: (patch) => set({ query: { ...get().query, ...patch } }),

  // === results + selection ===
  results: [],
  selectedId: null,
  expandedId: null,
  sort: 'best',
  setSort: (sort) => set({ sort }),
  selectFlight: (id) => set({ selectedId: id }),
  toggleExpand: (id) => set({ expandedId: get().expandedId === id ? null : id }),

  // === filters ===
  filters: {
    directOnly: false,
    stops: new Set(['0', '1', '2']),
    airlines: new Set(),          // empty = all
    maxPrice: null,
    departWindow: 'any',          // any | morning | afternoon | evening | night
  },
  setFilter: (patch) => set({ filters: { ...get().filters, ...patch } }),
  resetFilters: () => set({
    filters: {
      directOnly: false,
      stops: new Set(['0', '1', '2']),
      airlines: new Set(),
      maxPrice: null,
      departWindow: 'any',
    },
  }),

  // === derived (computed via selectors below) ===
  filteredResults: () => applyFilters(get().results, get().filters),
  sortedResults:   () => sortResults(get().filteredResults(), get().sort),

  // === search action ===
  runSearch: (q) => {
    const query = { ...get().query, ...(q || {}) };
    const results = generateResults(query);
    set({
      query,
      results,
      scene: 'results',
      selectedId: results[0]?.id || null,
      expandedId: null,
      sort: 'best',
    });
  },

  // === Saved trips ===
  trips: loadTrips(),
  saveTrip: (r) => {
    const q = get().query;
    const id = `${q.from}-${q.to}-${q.depart}-${r.id}`;
    const existing = get().trips;
    if (existing.some(t => t.id === id)) return false;
    const next = [{
      id, savedAt: Date.now(), query: { ...q },
      snapshot: {
        airlineCode: r.airline.code,
        airlineName: r.airline.name,
        aircraftCode: r.aircraftCode,
        price: r.price,
        durMins: r.durMins,
        stops: r.stops,
        depMins: r.depMins,
        arrMins: r.arrMins,
        atlasScore: r.atlasScore,
      },
    }, ...existing].slice(0, 50);
    saveTrips(next);
    set({ trips: next });
    return true;
  },
  removeTrip: (id) => {
    const next = get().trips.filter(t => t.id !== id);
    saveTrips(next);
    set({ trips: next });
  },

  // === Settings (customization) ===
  settings: loadSettings(),
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    set({ settings: next });
  },

  // === Toast ===
  toast: null,
  showToast: (text) => {
    set({ toast: { text, t: Date.now() } });
    clearTimeout(get()._toastT);
    const t = setTimeout(() => set({ toast: null }), 2400);
    set({ _toastT: t });
  },
}));

// Helpers exposed for components that resolve free-form airport text on submit.
export { resolveIata };
