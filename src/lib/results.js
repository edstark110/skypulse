// ATLAS · result generator
// Deterministic, demo-honest. Each result carries the intelligence layers:
// ATLAS score, comfort, delayRisk, aircraft, segments, quality, pricing-percentile.

import { getAirports, getAirportByIata } from './airports.js';
import { AIRLINES, AIRCRAFT } from './airlines.js';
import { haversine, rng, hashStr } from './util.js';

const CABIN_MULT = {
  Economy: 1,
  'Premium Economy': 1.6,
  Business: 3.6,
  First: 6.5,
};

export function generateResults(query) {
  const from = getAirportByIata(query.from);
  const to = getAirportByIata(query.to);
  if (!from || !to) return [];

  const distKm = haversine(from, to);
  if (distKm < 50) return [];

  const seed = hashStr(`${query.from}-${query.to}-${query.depart}-${query.cabin}`);
  const rand = rng(seed);
  const cabinMult = CABIN_MULT[query.cabin] || 1;
  const baseDirect = Math.round(60 + (distKm / 850) * 60);

  const hubMatches = AIRLINES.filter(a => a.hub === from.iata || a.hub === to.iata);
  const candidates = [...hubMatches];
  for (const a of AIRLINES.filter(a => !hubMatches.includes(a))) {
    if (rand() < 0.55) candidates.push(a);
  }
  while (candidates.length < 7) candidates.push(AIRLINES[Math.floor(rand() * AIRLINES.length)]);

  const num = 6 + Math.floor(rand() * 3);
  const out = [];

  for (let i = 0; i < num && i < candidates.length; i++) {
    const airline = candidates[i];
    const aircraftCode = airline.fleet[Math.floor(rand() * airline.fleet.length)];
    const aircraft = AIRCRAFT[aircraftCode] || AIRCRAFT.B777;

    // Stops decision based on distance
    let stops;
    const r = rand();
    if (distKm < 1500)      stops = 0;
    else if (distKm < 4000) stops = r < 0.55 ? 0 : 1;
    else if (distKm < 9000) stops = r < 0.30 ? 0 : (r < 0.85 ? 1 : 2);
    else                    stops = r < 0.18 ? 0 : (r < 0.78 ? 1 : 2);

    const stopOverhead = stops === 0 ? 0
      : (stops === 1 ? 90 + Math.floor(rand() * 240)
                     : 240 + Math.floor(rand() * 360));
    const totalMins = baseDirect + stopOverhead + Math.floor(rand() * 30);
    const depMins = Math.floor(rand() * 24 * 60);

    // Price USD
    let price = (distKm * 0.075 + 80) * airline.tier * cabinMult;
    price *= (1 + (rand() - 0.5) * 0.18);
    if (stops > 0) price *= (1 - 0.06 * stops);
    price = Math.max(60, Math.round(price));

    // Segments
    const segments = buildSegments(rand, airline, aircraftCode, from, to, distKm, stops, depMins, totalMins);

    // Journey quality
    const overhead = (totalMins - baseDirect) / baseDirect;
    let quality = 100 - stops * 14 - Math.min(30, overhead * 80);
    if (depMins < 5 * 60 || depMins > 23 * 60) quality -= 6;
    quality = Math.max(20, Math.round(quality));

    // ATLAS score (0–10) blending comfort, reliability, quality
    const aircraftBonus =
      aircraftCode === 'A350' || aircraftCode === 'B787' ? 0.6
      : aircraftCode === 'A380' ? 0.4
      : 0;
    const atlasScore = Math.round(
      ((airline.baseComfort * 0.35 + airline.baseReliability * 0.35 + (quality / 10) * 0.30) + aircraftBonus) * 10
    ) / 10;

    // Delay risk — low / medium / high
    let delayRisk = 'low';
    if (airline.baseReliability < 7.5) delayRisk = 'medium';
    if (airline.baseReliability < 7.0 || stops >= 2) delayRisk = 'high';
    if (stops === 1) {
      const layoverMins = segments[1].depMins - segments[0].arrMins;
      if (layoverMins < 75) delayRisk = 'high';
    }

    // Comfort rating — 0–10 (airline + aircraft + cabin nudges)
    let comfort = airline.baseComfort;
    if (aircraftCode === 'A350' || aircraftCode === 'B787') comfort += 0.4;
    if (aircraftCode === 'A380') comfort += 0.3;
    if (query.cabin === 'Business' || query.cabin === 'First') comfort += 0.6;
    comfort = Math.min(10, Math.round(comfort * 10) / 10);

    out.push({
      id: `r${i}_${seed.toString(36)}`,
      airline,
      aircraftCode,
      aircraft,
      stops,
      durMins: totalMins,
      depMins,
      arrMins: depMins + totalMins,
      price,
      quality,
      atlasScore,
      comfort,
      delayRisk,
      segments,
    });
  }

  // Pricing percentile: each result's price rank within this result set
  const prices = out.map(r => r.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  out.forEach(r => {
    if (r.price < median * 0.92) r.priceTier = 'below';
    else if (r.price > median * 1.12) r.priceTier = 'above';
    else r.priceTier = 'stable';
    r.pricePctBelowMedian = Math.round(((median - r.price) / median) * 100);
  });

  return out;
}

function buildSegments(rand, airline, aircraftCode, from, to, distKm, stops, depMins, totalMins) {
  const segments = [];
  if (stops === 0) {
    segments.push({
      airline: airline.code,
      flightNum: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      aircraft: aircraftCode,
      from: from.iata, to: to.iata,
      depMins, arrMins: depMins + totalMins, durMins: totalMins,
    });
    return segments;
  }

  // Pick stop airport(s) geographically between
  const allPorts = getAirports();
  const candidateHubs = allPorts.filter(a => a.iata !== from.iata && a.iata !== to.iata);
  candidateHubs.sort((a, b) =>
    haversine(from, a) + haversine(a, to) - (haversine(from, b) + haversine(b, to))
  );
  const pool = candidateHubs.slice(0, 8 + stops);
  const hub1 = pool[Math.floor(rand() * pool.length)];
  const leg1 = Math.round(60 + (haversine(from, hub1) / 850) * 60);
  const layover1 = 60 + Math.floor(rand() * 180);

  segments.push({
    airline: airline.code,
    flightNum: `${airline.code}${100 + Math.floor(rand() * 900)}`,
    aircraft: aircraftCode,
    from: from.iata, to: hub1.iata,
    depMins, arrMins: depMins + leg1, durMins: leg1,
  });

  if (stops === 1) {
    const leg2 = Math.round(60 + (haversine(hub1, to) / 850) * 60);
    segments.push({
      airline: airline.code,
      flightNum: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      aircraft: aircraftCode,
      from: hub1.iata, to: to.iata,
      depMins: depMins + leg1 + layover1,
      arrMins: depMins + leg1 + layover1 + leg2,
      durMins: leg2,
    });
  } else {
    const hub2 = pool[(pool.indexOf(hub1) + 1 + Math.floor(rand() * (pool.length - 1))) % pool.length] || pool[0];
    const leg2 = Math.round(45 + (haversine(hub1, hub2) / 850) * 60);
    const layover2 = 60 + Math.floor(rand() * 180);
    const leg3 = Math.round(60 + (haversine(hub2, to) / 850) * 60);

    segments.push({
      airline: airline.code,
      flightNum: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      aircraft: aircraftCode,
      from: hub1.iata, to: hub2.iata,
      depMins: depMins + leg1 + layover1,
      arrMins: depMins + leg1 + layover1 + leg2,
      durMins: leg2,
    });
    segments.push({
      airline: airline.code,
      flightNum: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      aircraft: aircraftCode,
      from: hub2.iata, to: to.iata,
      depMins: depMins + leg1 + layover1 + leg2 + layover2,
      arrMins: depMins + leg1 + layover1 + leg2 + layover2 + leg3,
      durMins: leg3,
    });
  }
  return segments;
}

export function sortResults(list, mode) {
  const arr = [...list];
  switch (mode) {
    case 'cheap':    arr.sort((a, b) => a.price - b.price); break;
    case 'fast':     arr.sort((a, b) => a.durMins - b.durMins); break;
    case 'comfort':  arr.sort((a, b) => b.comfort - a.comfort); break;
    case 'risk':     arr.sort((a, b) => riskRank(a) - riskRank(b)); break;
    case 'best':
    default:         arr.sort((a, b) => bestScore(a) - bestScore(b)); break;
  }
  return arr;
}
function riskRank(r) { return { low: 0, medium: 1, high: 2 }[r.delayRisk]; }
function bestScore(r) {
  return r.price * 0.45 + r.durMins * 0.25 - r.atlasScore * 25;
}

export function applyFilters(list, f) {
  return list.filter(r => {
    if (f.directOnly && r.stops !== 0) return false;
    if (f.stops && f.stops.size && !f.stops.has(String(r.stops))) return false;
    if (f.airlines && f.airlines.size && !f.airlines.has(r.airline.code)) return false;
    if (f.maxPrice != null && r.price > f.maxPrice) return false;
    if (f.departWindow && f.departWindow !== 'any') {
      const h = Math.floor(r.depMins / 60) % 24;
      if (f.departWindow === 'morning'   && !(h >= 5 && h < 12)) return false;
      if (f.departWindow === 'afternoon' && !(h >= 12 && h < 17)) return false;
      if (f.departWindow === 'evening'   && !(h >= 17 && h < 22)) return false;
      if (f.departWindow === 'night'     && !(h >= 22 || h < 5)) return false;
    }
    return true;
  });
}
