# WRC River Conditions

**"Can I Row Today?"** — Live river safety dashboard for Willamette Rowing Club members.

Fetches USGS velocity + water temp, NOAA stage/flow, and NWS weather to compute the current WRC safety flag, then displays it alongside river gauges, a wind advisory, and a 7-day forecast.

---

## Local development

```bash
npm install
npm run dev
```

The Vite dev server proxies `/usgs-proxy/*`, `/nwps-proxy/*`, and `/nws-proxy/*` directly to the upstream APIs — no Worker needed locally.

---

## Deployment

### 1. Deploy the Cloudflare Worker (proxy)

The Worker lives in `worker/`. You need a free Cloudflare account.

```bash
cd worker
npm install
npx wrangler login        # one-time browser login
npx wrangler deploy
```

Note the Worker URL printed after deploy (e.g. `https://wrc-conditions-proxy.<subdomain>.workers.dev`).

Update `worker/wrangler.toml` → `ALLOWED_ORIGINS` to include your final Cloudflare Pages URL once you know it.

### 2. Deploy the React app to Cloudflare Pages

Connect the `ssnowplow/wrc-conditions` GitHub repo to Cloudflare Pages:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output dir | `dist` |
| Environment variable | `VITE_WORKER_URL` = your Worker URL from step 1 |

### 3. Update the member portal Dashboard link

In `src/pages/Dashboard.jsx` in the **member portal** repo, update:

```js
const CONDITIONS_APP_URL = 'https://wrc-conditions.pages.dev'
```

Replace with your actual Cloudflare Pages URL if it differs.

---

## Architecture

```
Browser → Cloudflare Pages (React app)
              ↓ fetch(?url=...)
        Cloudflare Worker (proxy + 5-min edge cache)
              ↓
   USGS / NOAA NWPS / NWS APIs
```

| Data source | What it provides | Station/endpoint |
|---|---|---|
| USGS Instantaneous Values | Velocity (fps) + water temp (°C) | Station 14211720 |
| NOAA NWPS | River stage (ft) + flow (cfs) | Gauge PRTO3 |
| NWS | Current conditions + 7-day forecast | Grid PQR/112,97 |

## Flag logic

| Flag | Velocity | Temp | Requirements |
|---|---|---|---|
| 🟢 GREEN | < 1.5 fps | ≥ 50 °F | PFDs encouraged below 60 °F |
| 🟡 YELLOW | 1.5–2.4 fps *or* temp < 50 °F | — | 4-oar min, safety launch/PFDs for singles & pairs |
| 🟠 ORANGE | 2.5–2.9 fps *or* temp < 40 °F | — | Safety launch required for all club boats |
| 🔴 RED | 3.0–3.4 fps | — | 8-oar min (8+s/quads), launch must be in sight |
| ⚫ BLACK | ≥ 3.5 fps | — | Dock closed |

Wind is informational only — does not change the flag color.
