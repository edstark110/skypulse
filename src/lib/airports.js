// ATLAS · airports
// 35-hub seed for instant render + lazy fetch of full 7,060 IATA dataset.

export const SEED_AIRPORTS = [
  { iata:'DXB', city:'Dubai',         country:'United Arab Emirates', lat:25.253,  lng:55.365  },
  { iata:'AUH', city:'Abu Dhabi',     country:'United Arab Emirates', lat:24.433,  lng:54.651  },
  { iata:'DOH', city:'Doha',          country:'Qatar',                lat:25.273,  lng:51.608  },
  { iata:'JED', city:'Jeddah',        country:'Saudi Arabia',         lat:21.679,  lng:39.156  },
  { iata:'RUH', city:'Riyadh',        country:'Saudi Arabia',         lat:24.957,  lng:46.698  },
  { iata:'LHR', city:'London',        country:'United Kingdom',       lat:51.470,  lng:-0.454  },
  { iata:'LGW', city:'London',        country:'United Kingdom',       lat:51.148,  lng:-0.190  },
  { iata:'CDG', city:'Paris',         country:'France',               lat:49.009,  lng:2.547   },
  { iata:'AMS', city:'Amsterdam',     country:'Netherlands',          lat:52.310,  lng:4.768   },
  { iata:'FRA', city:'Frankfurt',     country:'Germany',              lat:50.037,  lng:8.562   },
  { iata:'MUC', city:'Munich',        country:'Germany',              lat:48.354,  lng:11.786  },
  { iata:'ZRH', city:'Zurich',        country:'Switzerland',          lat:47.464,  lng:8.549   },
  { iata:'MAD', city:'Madrid',        country:'Spain',                lat:40.493,  lng:-3.567  },
  { iata:'BCN', city:'Barcelona',     country:'Spain',                lat:41.297,  lng:2.078   },
  { iata:'FCO', city:'Rome',          country:'Italy',                lat:41.804,  lng:12.252  },
  { iata:'IST', city:'Istanbul',      country:'Turkey',               lat:41.275,  lng:28.752  },
  { iata:'JFK', city:'New York',      country:'United States',        lat:40.640,  lng:-73.779 },
  { iata:'EWR', city:'Newark',        country:'United States',        lat:40.689,  lng:-74.175 },
  { iata:'LAX', city:'Los Angeles',   country:'United States',        lat:33.942,  lng:-118.408},
  { iata:'SFO', city:'San Francisco', country:'United States',        lat:37.621,  lng:-122.379},
  { iata:'ORD', city:'Chicago',       country:'United States',        lat:41.978,  lng:-87.904 },
  { iata:'YYZ', city:'Toronto',       country:'Canada',               lat:43.677,  lng:-79.630 },
  { iata:'GRU', city:'São Paulo',     country:'Brazil',               lat:-23.435, lng:-46.473 },
  { iata:'NRT', city:'Tokyo',         country:'Japan',                lat:35.765,  lng:140.386 },
  { iata:'HND', city:'Tokyo',         country:'Japan',                lat:35.553,  lng:139.781 },
  { iata:'ICN', city:'Seoul',         country:'South Korea',          lat:37.469,  lng:126.450 },
  { iata:'HKG', city:'Hong Kong',     country:'China',                lat:22.308,  lng:113.918 },
  { iata:'SIN', city:'Singapore',     country:'Singapore',            lat:1.364,   lng:103.991 },
  { iata:'BKK', city:'Bangkok',       country:'Thailand',             lat:13.690,  lng:100.750 },
  { iata:'DEL', city:'Delhi',         country:'India',                lat:28.557,  lng:77.100  },
  { iata:'BOM', city:'Mumbai',        country:'India',                lat:19.089,  lng:72.868  },
  { iata:'SYD', city:'Sydney',        country:'Australia',            lat:-33.946, lng:151.177 },
  { iata:'MEL', city:'Melbourne',     country:'Australia',            lat:-37.673, lng:144.843 },
  { iata:'JNB', city:'Johannesburg',  country:'South Africa',         lat:-26.139, lng:28.246  },
  { iata:'CAI', city:'Cairo',         country:'Egypt',                lat:30.121,  lng:31.405  },
];

// Loaded lazily. Cached in module scope so multiple components share it.
let _full = null;
let _byIata = null;
let _loadingPromise = null;

export function getAirports() {
  return _full || SEED_AIRPORTS;
}
export function getAirportByIata(iata) {
  if (_byIata) return _byIata[iata];
  return SEED_AIRPORTS.find(a => a.iata === iata);
}
export function airportsLoaded() {
  return !!_full;
}

export function loadFullAirports() {
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = fetch('/airports.json')
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(rows => {
      _full = rows.map(r => ({
        iata: r[0], city: r[1], country: r[2],
        lat:  r[3], lng:  r[4], name: r[5],
      }));
      _byIata = Object.fromEntries(_full.map(a => [a.iata, a]));
      return _full;
    })
    .catch(err => {
      console.warn('[atlas] Full airport list unavailable; using seed.', err);
      return SEED_AIRPORTS;
    });
  return _loadingPromise;
}

/** Ranked match scoring across airports. */
export function searchAirports(term, limit = 8) {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  const pool = getAirports();
  const ranked = [];
  for (const a of pool) {
    const ia = a.iata.toLowerCase();
    const ci = a.city.toLowerCase();
    const co = a.country.toLowerCase();
    const nm = (a.name || '').toLowerCase();
    let s = 0;
    if (ia === t)                s = 100;
    else if (ia.startsWith(t))   s = 90;
    else if (ci === t)           s = 80;
    else if (ci.startsWith(t))   s = 70;
    else if (nm.startsWith(t))   s = 60;
    else if (ci.includes(t))     s = 50;
    else if (nm.includes(t))     s = 40;
    else if (co.startsWith(t))   s = 30;
    else if (co.includes(t))     s = 20;
    else continue;
    ranked.push({ a, s });
  }
  ranked.sort((x, y) => y.s - x.s);
  return ranked.slice(0, limit).map(r => r.a);
}

export function airportLabel(iata) {
  if (!iata) return '';
  const a = getAirportByIata(iata);
  return a ? `${a.city} (${a.iata})` : iata;
}

export function resolveIata(text) {
  if (!text) return null;
  const t = text.trim().toUpperCase();
  if (getAirportByIata(t)) return t;
  const m = text.match(/\(([A-Z]{3})\)/);
  if (m && getAirportByIata(m[1])) return m[1];
  const lower = text.trim().toLowerCase();
  const found = getAirports().find(
    a => a.city.toLowerCase() === lower || a.iata.toLowerCase() === lower
  );
  return found ? found.iata : null;
}
