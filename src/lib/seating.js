// ATLAS · seating intelligence
// Reads aircraft family from airlines.js, returns layout + best/worst zones.

import { AIRCRAFT } from './airlines.js';

/** Returns a seat-map plan for the schematic SVG:
 *  { rows, cols, layout, bestRows: number[], worstRows: number[], wing, exits, noiseRear, label }
 *  Best seats: front cabin (row 4–8), exit row, window in mid-cabin.
 *  Worst seats: last 3 rows (galley/lavatory), bulkhead row directly behind exit.
 */
export function seatPlan(aircraftCode) {
  const a = AIRCRAFT[aircraftCode];
  if (!a) return null;
  const rows = a.rows;
  const cols = parseLayout(a.layout);
  const bestRows = [4, 5, 6, 7, 8, a.exits[1], a.exits[1] + 1];
  const worstRows = [rows - 3, rows - 2, rows - 1, rows, a.exits[0] - 1];

  return {
    aircraftCode,
    label: a.label,
    family: a.family,
    layout: a.layout,
    rows, cols,
    bestRows, worstRows,
    wing: a.wing,
    exits: a.exits,
    noiseRear: a.noiseRear,
    insights: seatInsights(a),
  };
}

function parseLayout(layoutStr) {
  // "3-4-3" → [3,4,3]; total seat columns per row
  return layoutStr.split('-').map(n => parseInt(n, 10));
}

function seatInsights(a) {
  const out = [];
  if (a.family === 'widebody' && a.layout === '3-3-3') {
    out.push({ kind:'good', text:'Premium widebody layout — aisle access on every seat in business.' });
  }
  if (a.layout === '3-4-3') {
    out.push({ kind:'neutral', text:'Wider 3-4-3 economy — middle of the centre block has dual-aisle access.' });
  }
  if (a.noiseRear) {
    out.push({ kind:'warn', text:'Rear cabin runs louder on this airframe — favour mid-cabin.' });
  } else {
    out.push({ kind:'good', text:'Quieter rear cabin acoustics on this airframe.' });
  }
  if (a.family === 'jumbo') {
    out.push({ kind:'good', text:'Upper deck (when offered) is the quietest section overall.' });
  }
  out.push({ kind:'good', text:'Exit-row seats offer extra legroom — usually require purchase.' });
  return out;
}
