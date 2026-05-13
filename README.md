# ATLAS

A calm intelligence layer for global flight decisions.
Compare by comfort, timing, weather, aircraft, and reliability — not just price.

Live: <https://skypulse-omega.vercel.app>

## Stack

- **React 18** + **Vite 5** + **Tailwind CSS**
- **Zustand** for state · **Framer Motion** for motion · **Lenis** for smooth scroll
- Deterministic pricing + 7,060 IATA airports (lazy-loaded from `public/airports.json`)
- Booking handoff via Google Flights deep links

## Architecture

```
src/
  app/            App.jsx, SceneManager.jsx
  scenes/         IdleScene, SearchScene, ResultsScene, TripsScene
  components/     Globe, SearchBar, AirportInput, FlightList, FlightCard,
                  FilterPanel, MapPanel, ContextPanel, AircraftSchematic,
                  WeatherCard, PricingInsight, DirectVsConnecting,
                  TopTicker, SettingsDrawer, Header, Toast
  lib/            airports · airlines · results · intelligence · weather
                  seating · booking · motion · util
  state/          useFlightStore (Zustand)
  styles/         index.css (Tailwind layers)
```

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run preview      # serve dist build
```

## Honesty

ATLAS shows no fake telemetry, no fake urgency, no live tracking claims.

- **Booking** hands off to Google Flights for real availability.
- **Pricing intelligence** ("Below typical / Stable / Above typical") is computed
  from the returned result set's median — never made up.
- **Weather** is deterministic by route + date, framed as
  "expected at this time of year" — not live.
- **Field-note ticker** uses aviation industry truisms, not live alerts.
- **Aircraft schematic** shows known cabin patterns by family — not real-time seat maps.

## Customization

Use the **Customize** link in the header to control:

- Motion intensity (low / medium / high)
- Card density (compact / standard / expanded)
- Intelligence verbosity (minimal / standard / detailed)
- Map animations on/off
- Currency display

Defaults are always clean, minimal, trusted.

## Deploy

`git push` — Vercel auto-detects Vite, runs `npm run build`, serves `dist/`.

## License

MIT — see `LICENSE`.
