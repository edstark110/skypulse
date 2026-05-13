// ATLAS · intelligence layer
// All signals derive from real result data — no fake telemetry, no urgency tricks.

import { fmtDuration, fmtPrice } from './util.js';

/** Pros & cons from real signals only. */
export function buildProsAndCons(r, all) {
  const pros = [], cons = [];
  const cheapest = Math.min(...all.map(x => x.price));
  const fastest  = Math.min(...all.map(x => x.durMins));
  const bestQuality = Math.max(...all.map(x => x.quality));

  if (r.stops === 0) pros.push('Direct flight, no transfers');
  if (r.price === cheapest) pros.push('Lowest fare on this route');
  if (r.durMins === fastest) pros.push('Shortest total duration');
  if (r.quality === bestQuality && r.quality >= 80) pros.push('Highest journey quality score');
  if (r.comfort >= 9) pros.push('Top-tier cabin comfort');
  if (r.delayRisk === 'low' && r.airline.baseReliability >= 8.5) pros.push('Strong reliability record');
  if (r.aircraftCode === 'A350' || r.aircraftCode === 'B787') {
    pros.push('Newer airframe — quieter, better cabin air');
  }

  if (r.stops >= 2) cons.push(`${r.stops} layovers extend the trip`);
  if (r.depMins < 5 * 60) cons.push('Early-morning departure');
  if (r.depMins > 23 * 60) cons.push('Late-night departure');
  if (r.delayRisk === 'high') cons.push('Elevated delay risk on this routing');

  const layoverMins = r.segments.length > 1
    ? r.segments.slice(0, -1).reduce((s, seg, i) => s + (r.segments[i + 1].depMins - seg.arrMins), 0)
    : 0;
  if (r.stops === 1 && layoverMins < 90) cons.push('Tight connection time');
  if (layoverMins > 4 * 60) cons.push(`Long total layover (${fmtDuration(layoverMins)})`);

  return { pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
}

/** Single-sentence context insight for the bottom-right intelligence panel. */
export function contextSignal(r, all, query, currency) {
  if (!r) return 'Select a flight to see how it stacks up.';
  const cheapest = Math.min(...all.map(x => x.price));
  const fastest  = Math.min(...all.map(x => x.durMins));
  const expensive = Math.max(...all.map(x => x.price));

  if (r.price === cheapest && r.durMins === fastest) {
    return 'Best on both price and duration. The clearest pick among the returned options.';
  }
  if (r.price === cheapest) {
    return `Lowest fare among ${all.length} options. Saves up to ${fmtPrice(expensive - r.price, currency)} versus the most expensive.`;
  }
  if (r.durMins === fastest) {
    return `Fastest itinerary in this set${r.stops === 0 ? ' — and nonstop.' : '.'}`;
  }
  if (r.atlasScore >= 9) {
    return `ATLAS score of ${r.atlasScore} — top reliability, comfort, and journey quality combined.`;
  }
  if (r.stops === 0) {
    return 'Nonstop. No transfer risk, no layover wait.';
  }
  if (r.delayRisk === 'high') {
    return 'Elevated delay risk on this routing — consider widening the connection or a direct alternative.';
  }
  return `${all.filter(x => x.price < r.price).length} cheaper options exist, but this carries a stronger ATLAS score.`;
}

/** Pricing insight — contextual, not spam. */
export function pricingInsight(r, all) {
  if (!r) return null;
  if (r.priceTier === 'below') {
    return {
      tone: 'good',
      label: 'Below typical for this route',
      detail: `Roughly ${r.pricePctBelowMedian}% below the median of returned options.`,
    };
  }
  if (r.priceTier === 'above') {
    return {
      tone: 'warn',
      label: 'Above typical for this route',
      detail: 'Higher than the median of returned options — usually reflects premium service or peak timing.',
    };
  }
  return {
    tone: 'neutral',
    label: 'Stable pricing trend',
    detail: 'In line with comparable options on this route and date.',
  };
}

/** Direct vs Connecting tradeoff summary across the result set. */
export function directVsConnecting(all) {
  const directs = all.filter(r => r.stops === 0);
  const stops = all.filter(r => r.stops > 0);
  if (!directs.length || !stops.length) return null;
  const cheapestDirect = directs.reduce((a, b) => a.price < b.price ? a : b);
  const cheapestStop   = stops.reduce((a, b) => a.price < b.price ? a : b);
  const fastestDirect  = directs.reduce((a, b) => a.durMins < b.durMins ? a : b);
  const fastestStop    = stops.reduce((a, b) => a.durMins < b.durMins ? a : b);

  return {
    priceDelta: cheapestDirect.price - cheapestStop.price,
    timeDelta:  fastestStop.durMins - fastestDirect.durMins,
    directReliability: avg(directs.map(r => r.airline.baseReliability)).toFixed(1),
    stopReliability:   avg(stops.map(r => r.airline.baseReliability)).toFixed(1),
    cheapestDirect,
    cheapestStop,
  };
}
const avg = arr => arr.reduce((s, x) => s + x, 0) / Math.max(1, arr.length);
