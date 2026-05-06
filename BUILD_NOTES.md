# SkyPulse — Build Notes

> A single-file, ~460KB HTML flight intelligence app built iteratively through ~25 prompts.
> Live at http://localhost:8080 (Node static server in `server.js`).

---

## What it is

A **flight search + intelligence dashboard** that goes beyond Skyscanner-class trackers:
real-time-feel pricing across 14 sources, mix-and-match routing optimizer,
geopolitical disruption tracker, animated world map (FlightRadar-style with
real continents from world-atlas TopoJSON), aircraft modal with Jarvis-style
schematic + seat map + fare comparator, airport modal with country flag +
seasonality + lounges + animated passenger journey, command palette (⌘K),
self-auditing intelligence agent with Web Vitals + a11y + scoring.

All client-side. No build step. One file: `index.html`.

---

## File structure

```
C:\flight-tracker\
├── index.html        ← the entire app (~460KB)
├── server.js         ← 30-line Node static server
└── BUILD_NOTES.md    ← this file
```

`index.html` is organized as one giant document with three concatenated layers:

1. **`<head>`** — fonts (Inter + JetBrains Mono via Google), Chart.js, d3-geo, topojson-client (CDN)
2. **`<style>`** — base CSS (friendly), then military terminal override, then Apple-grade premium override, then route results CSS, then hyper-intelligence CSS, then Jarvis blueprint CSS, then seat-availability/fare-comparator/journey CSS. Each block layered, last-declared wins on conflicts.
3. **`<body>`** — DOM (nav, hero, search, stats, macro strip, world map, route results, deals, smart routes, trends, geo, sources, ticker, alerts, destinations, footer) + modals + agent panel + diagnostic HUD + toast stack + launch overlay
4. **`<script>`** — data → render → bind → init pattern

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | None — vanilla JS |
| Charts | Chart.js (CDN) |
| Geographic data | d3-geo + topojson-client + world-atlas (CDN) |
| Aircraft logos | aviasales/travelpayouts free CDN (`pics.avs.io`) |
| Country flags | flagcdn.com |
| Fonts | Inter + JetBrains Mono (Google) |
| Backend | None — static file served by 30-line Node script |
| State | Plain JS object (`state`, `AGENT`, `DIAG_STATE`, `MACRO_STATE`) |
| Persistence | localStorage (currency only) |

---

## What got built — chronological

Each row is one prompt → what shipped.

| # | User asked | Built |
|---|---|---|
| 1 | "create a flight price tracker, world-class UI" | Initial single-file HTML — hero, search, animated bg, deals grid, ticker, source matrix, trends chart |
| 2 | "search shows IATA codes, drop Skyscanner-as-benchmark" | Fuzzy IATA autocomplete, removed benchmark labels |
| 3 | "mix and match routes, war impacts, all-in-one" | Smart routes section, geopolitical tracker |
| 4 | "where's the link?" | Local Node static server on :8080 |
| 5 | "master state, live animations, news, global search broken on 'cohinc'" | World map with planes + heat zones + news feed, fuzzy bigram-dice search |
| 6 | "I meant Cochin (Kerala) not China" | Alias dictionary (Cochin→Kochi, Bombay→Mumbai, Madras→Chennai, etc.) + 8 more Indian airports |
| 7 | "real flight search logic — direct fares first, then connections" | AIRLINE_DATA (70+ carriers), `generateDirectFlights`, `generateConnections`, route-results section |
| 8 | "world-class Apple-grade UI" | Premium override CSS (Inter, glassmorphism, springs, gradients) |
| 9 | "command palette, self-diagnosis, insane analytics" | ⌘K palette, diagnostics HUD, Web Vitals, agent foundation |
| 10 | "compress, world-class icons, currency selector, why prices move" | 18-currency selector with `fmtMoney()`, macro intel strip, price-drivers panel, aircraft type icons |
| 11 | "zoom map on specific destination, real airline logos, weather/ATC, search globe animation" | Map viewBox tween, aviasales logo CDN, weather pills, search-launch globe overlay |
| 12 | "animated takeoff/landing on route line, BBC background" | SVG `animateMotion` plane, hero canvas constellation + flight arcs + wireframe globe |
| 13 | "plane was upside down, BBC bg missing" | Fixed z-index, plane SVG redrawn pointing east, larger size, flight arcs amplified |
| 14 | "build an intelligence agent that audits + self-improves" | Slide-in agent panel: Web Vitals, scoring, reasoning chain, recommendations, auto-actions |
| 15 | "click aircraft → schematic, click airport → guide" | Aircraft modal with seat map + best/avoid seats, airport modal with tips/layovers/food |
| 16 | "Jarvis blueprint with safety exits + technical detail" | Jarvis schematic with cabin zones, doors, engines, annotations, radar sweep |
| 17 | "wireframe shape too cheap, country flags, lounges, seasonality, airline icons" | Bezier-curved fuselage, winglets, cockpit windows, jet engine nacelles, country flags via flagcdn, lounge cards, seasonality chart, airline logo strip |
| 18 | "live seat availability, animated passenger journey, fare class comparator" | Seat map with taken/free/★pick, journey walkthrough with passenger dot, fare class benefit grid |

---

## Architectural patterns

### 1. Layered CSS overrides
Each major aesthetic shift was added as a new override block at the end of `<style>`, redeclaring CSS variables (`:root { --bg-0: ...; }`) and adding higher-specificity rules. Last-declared wins on ties.

```
base CSS (friendly purple/blue rounded)
  → military intel override (cyan/green sharp corners terminal)
    → premium Apple override (Inter, glass, springs)
      → flightradar map override
        → hyper-intelligence (modals, blueprint, journey)
```

### 2. Render-replace, not virtual DOM
Every render function builds a complete HTML string and assigns to `innerHTML`. Cheaper than a framework, plenty fast for our scale.

### 3. Override pattern for hooks
When extending an existing function (e.g., adding score badges to direct flights post-render), the original is captured and wrapped:

```js
const _origRenderDirectFlights = renderDirectFlights;
renderDirectFlights = function(directs, currency) {
  _origRenderDirectFlights(directs, currency);
  // ... post-process the rendered DOM
};
```

This let me layer in CO₂ pills, score badges, aircraft icons, click handlers, flight-personality tags without touching the core function.

### 4. Data-driven rendering
Every visible section is fed by a JS data structure:
- `AIRPORTS_DB` → 220+ airports `[code, city, country, lat, lng]`
- `AIRPORT_ALIASES` → fuzzy match support
- `AIRLINE_DATA` → 70+ carriers with hubs, fleet, brand color
- `AIRCRAFT_DB` → 15 types with full specs, layouts, best/avoid seats
- `AIRPORT_GUIDES` → 13 airports with seasonality, lounges, tips
- `GEO_IMPACTS` → 6 disruption zones
- `CURRENCIES` → 18 currencies + FX rates
- `FARE_BENEFITS` → F/J/W/Y industry typical specs
- `MACRO_STATE` → 8 live ticker streams (Brent, FX, etc.)

Swap any of these with a real API and it just works.

### 5. Spring + cubic-bezier everywhere
```css
--ease: cubic-bezier(0.32, 0.72, 0, 1);          /* iOS */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);    /* Apple over-shoot */
```
Used on all hover, modal, and panel transitions. Gives the "expensive" feel.

### 6. SVG-first for visualizations
Aircraft blueprint, seat map, route flight line, world map planes, journey walkthrough, sparklines, score bars — all SVG. Crisp at any zoom, animatable via attributes or CSS.

---

## Notable functional bits

### `searchAirports(q)` — fuzzy 2-pass
1. **Exact pass**: code/city/country with startsWith/contains scoring + alias lookup
2. **Fuzzy fallback**: bigram dice coefficient if first pass yields <4 hits

That's how "cohinc" finds China and "Cochin" finds COK.

### `fmtMoney(gbp)` — universal money
All prices stored in GBP internally; rendered through this function which applies user's selected currency rate + symbol. One function call, app-wide consistency.

### `performRouteSearch()` — branching UX
- Specific destination → flight options table + drivers + calendar + zoomed map
- "Anywhere" destination → deals grid + smart routes + destinations grid + global map

Mode-switched via `setSearchMode("specific" | "anywhere")` showing/hiding sections.

### Agent's auto-cycle (every 5s)
1. Re-audit accessibility (alt text, ARIA, touch sizes)
2. Recompute scores from real Web Vitals + FPS + source latency
3. Generate recommendations from current state (FPS, LCP, fuel prices, journey decisions)
4. Auto-apply actions (throttle on FPS<30, respect prefers-reduced-motion)
5. Log ambient observations to keep reasoning chain alive

### Aircraft blueprint — parameterized SVG
Single `aircraftBlueprintSvg(ac)` function reads `ac.length`, `ac.wingspan`, `ac.engines`, `ac.seats`, `ac.name` and generates a viewBox-correct silhouette with cubic-curve fuselage, swept wings, optional winglets, jet/turboprop engine differentiation, cabin zones sized to actual seat counts, exits placed at fuselage fractions appropriate to size. Plus 6 fade-in annotations + radar sweep.

---

## What you can learn from this codebase

1. **You don't need React for a dashboard like this** — vanilla `innerHTML` works at this scale and is faster to iterate.
2. **CSS variables + layered overrides** beats theme-switching boilerplate. Just declare `:root` again.
3. **PerformanceObserver** is the right way to measure real Web Vitals client-side.
4. **TopoJSON + d3-geo** is ~100KB and gives you a real world map without a tile server.
5. **Free public CDNs exist for airline logos and country flags** — aviasales pics + flagcdn.
6. **`<animateMotion>` along an `<mpath>`** with `keySplines` is the cleanest way to animate an icon along a curved path with non-linear timing.
7. **A "self-audit agent"** as a UI feature isn't a gimmick — Web Vitals + a11y checks + auto-throttling are real, and surfacing them differentiates the product.
8. **Click-to-deepen** on every entity (airline → modal, airport → modal, aircraft → modal, route → focus) is what makes the experience feel infinite.

---

## Suggested next steps to explore

1. **Wire to a real API**: replace `generateDirectFlights()` with a `fetch()` to Amadeus / Kiwi.com / Duffel.
2. **Persist user prefs**: extend localStorage to remember origin, recent searches, alert subscriptions.
3. **Service worker**: ship offline mode + faster repeat loads.
4. **Real seat availability**: OAG or airline NDC integration for actual seat-map data.
5. **Real-time disruption feed**: NOTAM API + news scraping for the geo tracker.
6. **Visual regression tests**: snapshot the modals, agent panel, blueprint at common viewport sizes.
7. **Reduce file size**: split into modules + bundler if you ever pass 500KB.
