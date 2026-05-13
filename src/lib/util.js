// Pure utilities — distance, time formatting, deterministic RNG, currency.

export function haversine(a, b) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const lat1 = rad(a.lat), lat2 = rad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.00 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  AED: { symbol: 'AED ', rate: 3.67 },
  INR: { symbol: '₹', rate: 83.5 },
  JPY: { symbol: '¥', rate: 153 },
  SGD: { symbol: 'S$', rate: 1.34 },
  CAD: { symbol: 'C$', rate: 1.36 },
  AUD: { symbol: 'A$', rate: 1.52 },
};

export function fmtPrice(usd, currency = 'USD') {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const local = usd * c.rate;
  const rounded = local >= 100 ? Math.round(local) : Math.round(local * 10) / 10;
  return `${c.symbol}${rounded.toLocaleString('en-US')}`;
}

export function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function fmtTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function todayISO(off = 0) {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
