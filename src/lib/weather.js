// ATLAS · weather intelligence
// Deterministic per-route based on date + lat/lng + season.
// Honest framing: "expected" / "typical for this corridor at this time of year".
// No fake live telemetry.

import { hashStr, rng } from './util.js';

const CONDITIONS = [
  { id:'clear',   label:'Clear',          icon:'☀',  good:true  },
  { id:'partly',  label:'Partly cloudy',  icon:'⛅', good:true  },
  { id:'cloudy',  label:'Cloudy',         icon:'☁',  good:true  },
  { id:'rain',    label:'Rain showers',   icon:'☂',  good:false },
  { id:'storms',  label:'Thunderstorms',  icon:'⚡', good:false },
  { id:'snow',    label:'Snow',           icon:'❄',  good:false },
  { id:'fog',     label:'Fog',            icon:'≈',  good:false },
];

function seasonAt(lat, month) {
  const north = lat >= 0;
  // m: 0=Jan ... 11=Dec
  if (north) {
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4)  return 'spring';
    if (month >= 5 && month <= 7)  return 'summer';
    return 'autumn';
  } else {
    if (month >= 11 || month <= 1) return 'summer';
    if (month >= 2 && month <= 4)  return 'autumn';
    if (month >= 5 && month <= 7)  return 'winter';
    return 'spring';
  }
}

function tropicalBand(lat) { return Math.abs(lat) <= 23.5; }
function temperateBand(lat) { return Math.abs(lat) > 23.5 && Math.abs(lat) <= 60; }
function polarBand(lat) { return Math.abs(lat) > 60; }

function conditionAt(lat, lng, dateIso, salt) {
  const seed = hashStr(`${lat.toFixed(2)}:${lng.toFixed(2)}:${dateIso}:${salt}`);
  const r = rng(seed);
  const month = new Date(dateIso + 'T12:00:00').getMonth();
  const season = seasonAt(lat, month);

  const x = r();
  if (tropicalBand(lat)) {
    // Lots of clear / partly, occasional rain or storms in wet season
    if (x < 0.45) return CONDITIONS[0];
    if (x < 0.75) return CONDITIONS[1];
    if (x < 0.90) return CONDITIONS[2];
    if (x < 0.97) return CONDITIONS[3];
    return CONDITIONS[4];
  }
  if (temperateBand(lat)) {
    if (season === 'summer') {
      if (x < 0.45) return CONDITIONS[0];
      if (x < 0.75) return CONDITIONS[1];
      if (x < 0.90) return CONDITIONS[2];
      if (x < 0.97) return CONDITIONS[3];
      return CONDITIONS[4];
    }
    if (season === 'winter') {
      if (x < 0.30) return CONDITIONS[1];
      if (x < 0.55) return CONDITIONS[2];
      if (x < 0.75) return CONDITIONS[3];
      if (x < 0.88) return CONDITIONS[5];
      return CONDITIONS[6];
    }
    // spring / autumn
    if (x < 0.30) return CONDITIONS[0];
    if (x < 0.55) return CONDITIONS[1];
    if (x < 0.80) return CONDITIONS[2];
    return CONDITIONS[3];
  }
  // polar
  if (season === 'winter') {
    if (x < 0.30) return CONDITIONS[2];
    if (x < 0.65) return CONDITIONS[5];
    return CONDITIONS[6];
  }
  if (x < 0.40) return CONDITIONS[1];
  if (x < 0.75) return CONDITIONS[2];
  return CONDITIONS[3];
}

/** Approximate temperature (°C) by latitude band + season + a small random nudge. */
function tempAt(lat, dateIso, salt) {
  const seed = hashStr(`t:${lat.toFixed(2)}:${dateIso}:${salt}`);
  const r = rng(seed);
  const month = new Date(dateIso + 'T12:00:00').getMonth();
  const season = seasonAt(lat, month);
  let base;
  if (tropicalBand(lat))      base = 28;
  else if (temperateBand(lat)) base = season === 'summer' ? 24 : season === 'winter' ? 4 : 14;
  else                         base = season === 'summer' ? 4  : -18;
  const noise = (r() - 0.5) * 6;
  return Math.round(base + noise);
}

/** Turbulence risk based on great-circle latitude span + season + presence of jet-stream corridors. */
export function turbulenceFor(from, to, dateIso) {
  const seed = hashStr(`tb:${from.iata}-${to.iata}-${dateIso}`);
  const r = rng(seed);
  const span = Math.abs(from.lat - to.lat);
  const month = new Date(dateIso + 'T12:00:00').getMonth();
  // Northern winter increases jet-stream strength
  const winterFactor = (month <= 1 || month >= 11) && (from.lat > 25 || to.lat > 25) ? 1 : 0;
  const score = span * 0.04 + winterFactor * 0.4 + r() * 0.3;
  if (score > 0.95) return { level: 'high',   label: 'Elevated', summary: 'Higher than average chop over the typical corridor at this time of year.' };
  if (score > 0.55) return { level: 'medium', label: 'Moderate', summary: 'Some bumps possible — typical for the latitude span on this route.' };
  return { level: 'low', label: 'Calm', summary: 'Generally smooth conditions expected at altitude on this corridor.' };
}

/** Full route weather summary: departure, arrival, turbulence, seasonal copy. */
export function weatherFor(from, to, dateIso) {
  const dep = {
    ...conditionAt(from.lat, from.lng, dateIso, 'dep'),
    temp: tempAt(from.lat, dateIso, 'dep'),
  };
  const arr = {
    ...conditionAt(to.lat, to.lng, dateIso, 'arr'),
    temp: tempAt(to.lat, dateIso, 'arr'),
  };
  const turb = turbulenceFor(from, to, dateIso);
  const month = new Date(dateIso + 'T12:00:00').getMonth();
  const fromSeason = seasonAt(from.lat, month);
  const toSeason   = seasonAt(to.lat, month);
  const seasonalNote =
    fromSeason !== toSeason
      ? `Departing in ${fromSeason}, arriving in ${toSeason}.`
      : `Both endpoints in ${fromSeason}.`;
  return { dep, arr, turb, seasonalNote };
}
