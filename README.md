# SkyPulse

**Real-time flight intelligence + price comparison · single-file architecture**

Live: **https://skypulse-omega.vercel.app**

A self-contained 600 KB HTML app that delivers Apple-grade flight search, multi-source price comparison, climate-aware weather + ATC overlays, and a 7-agent intelligence panel that audits itself in real time.

---

## Features

- 🌐 Real geographic world map (d3-geo + topojson + world-atlas)
- 🛫 220+ airports · 70+ airlines · 14 booking sources
- 🤖 7-agent intelligence system: COMMAND · SENTINEL · ATLAS · FORGE · ORACLE · AEGIS · AURA
- 📊 Live performance governor (FPS / memory / latency thresholds)
- 🌦 Climate-aware weather with seasonal monsoon modeling
- 🛰 ATC severity dots per airspace
- 💰 SkyPulse Score Engine — market baseline + deviation commentary
- ✈ Aircraft blueprints with anatomically-correct family geometry
- 🪟 Comparison view in new tab — system fonts, no FOUT
- 🗺 Single-file: no build step, no framework, deploys to any static host

## Quick start

```bash
node server.js
# SkyPulse running at http://localhost:8080
```

The Node server is just a 30-line static file server. The whole app is `index.html`.

## Deploy

```bash
# Vercel (one command)
vercel deploy --prod

# Or drag-and-drop index.html to:
#   pages.cloudflare.com · vercel.com · netlify.com/drop
```

## Architecture

| Module | What it does |
|---|---|
| **Phase 0** | Unified `STATE` spine + safeCall envelope + TTL cache + canonical schemas |
| **Phase 1-5** | Map · aircraft · airport engines · render queue · agent dimensions · perf governor |
| **Phase 7** | Calendar redesign · booking deeplinks · disclaimer card |
| **Phase 8** | Animation discipline · score engine · weather + ATC · 7-agent system · pipeline |
| **Phase 9** | Climate-aware weather · iOS-style route plane · ORACLE weather reasoning |
| **Phase 11** | Map cleanup · Compare-all-sources new-tab view (MutationObserver pattern) |
| **Phase 12-14** | Intel Panel hoist · live agent monitoring · Apple-discipline pass |

See `BUILD_NOTES.md` for full chronology.

## Console probes

```js
STATE                                  // unified state spine
AGENTS                                 // 7-agent registry
STATE.intelligence.pipeline.trace      // last pipeline run
SkyPulse.openFlightComparison(STATE.flights.directs[0])
bookingUrlV2('Skyscanner', 'DXB', 'COK')
```

## License

MIT — see `LICENSE`

---

Built with vanilla JS · zero dependencies at runtime (CDN only)
