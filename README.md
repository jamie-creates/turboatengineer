# Turboat Engineer

A touch-friendly boat engineering game for Windows browsers and iPhone/iPad Home Screen installation.

## Playable now

- Build a sealed hull from 13 individually placed panels across five stations.
- Drag panels from the parts tray, exchange installed panels, and add local cross braces.
- Pull mirrored hull corner handles and keel nodes to change width and depth. Keyboard arrows and tap-to-place are supported.
- Fit different materials to hull panels, seat shells, and the stern transom. Component supplies have independent ownership and unlock thresholds.
- Eleven material options, including bamboo, recycled HDPE, cork-core sandwich, basalt fiber, and aramid.
- Three engines with per-engine exhaust, intake, spark plug, piston, crankshaft, balancing, and port-and-polish upgrades.
- Harbor, pond, lake, river, fast-river, ocean, and marina courses.
- Solo judged events or races against one to three newly randomized computer boats.
- Local saves, JSON backup/restore, and production offline caching.

## Run on Windows

Use Node 24.19 or newer:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the URL printed by the server. Development does not install a service worker.

```powershell
npm.cmd test
npm.cmd run build
```

The Azure deployment artifact is `dist/client`. The build typechecks, exports static pages, and generates a versioned offline cache.

## Hosting plan

Target: `anemkai.com` (confirmed).

Azure address: https://red-river-0895c9d1e.5.azurestaticapps.net

The repository is `jamie-creates/turboatengineer`. Its workflow runs tests and builds on pushes and pull requests. Deployment requires an Azure Static Web App and the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

See [deployment setup](docs/DEPLOYMENT.md) and [physics model](docs/PHYSICS.md).

## Next online milestone

The current build stores progress only in this browser; login and cloud saves are not implemented. The intended architecture is Azure Static Web Apps + authenticated Azure Functions + a database. The API must scope records to the authenticated player and validate purchases, unlocks, and race rewards. Do not trust locally submitted balances for competitive progression.

## Limits

This is an early prototype. Shape editing uses a fixed five-station frame with mirrored sides, not arbitrary CAD topology. Races are compressed visualizations of estimated completion times; solo awards combine four categories. Hydrodynamics and material/tuning coefficients are uncalibrated engineering approximations. Physical iPhone/iPad performance and offline behavior still require device testing.

## Anemkai game library and cloud saves

The root route is the game library; Turboat Engineer lives at `/turboat/`.
The existing `turboat-save-v2` browser key is retained, so existing players keep progress on the same origin.
The garage stores up to 12 snapshots. Cloud synchronization is explicit: check the cloud, choose a save, then upload after playing. Concurrent uploads are guarded by Azure Table ETags.

The managed Azure Functions API uses Microsoft SWA identity or separate game accounts. Game accounts use salted scrypt password hashes, secure HttpOnly sessions, account/IP throttling, and one-time recovery codes. Password recovery rotates all sessions. Microsoft and game accounts have separate progress.

Backend configuration: `TURBOAT_STORAGE` is a server-only Azure Table connection string in SWA application settings. The `Turboat` table resides in `turboatsaves4b7d8943` (Standard LRS, metered storage). Never expose the API as an independent unprotected Functions endpoint; Microsoft identity headers are trusted only behind managed SWA. `TURBOAT_ORIGINS` optionally overrides the comma-separated allowed browser origins.

`npm run build` compiles the shared save validator into `api/shared/game.js`. GitHub Actions uploads frontend and API artifacts and Azure builds the API with Node 22. Local static preview supports guest play; cloud login requires the deployed API. Expired session records are rejected on reads; operational cleanup of expired sessions can be added as usage grows.

Sea-trial motion/load indicators and debrief comparisons are estimates derived from the game model, not a calibrated naval simulation. Races now integrate acceleration, curvature-limited cornering and intermittent wave impacts at 0.25-second steps. The replay, live course map, placing and debrief use the recorded trajectory; the replay compresses simulated time into 28 seconds. Rendering compresses course distances to keep boats visible. Collisions and manual steering are not simulated. Challenge bonuses are one-time; repeated races still give ordinary race rewards.

Race handling now uses hydrostatic stability for corner grip and wave height relative to freeboard for rough-water pace. This prevents tiny, low-freeboard hulls from winning every course through weight savings alone. The same handling envelope applies to sea trials and every race entrant; it is not a size-based reward. Regression fixtures compare equally powered plywood hulls on pond, fast river, and ocean courses.

Race failures: excessive roll causes capsizing; repeated hull stress or an overloaded engine mount causes structural failure. Plywood hull panels/transoms always accumulate destructive fatigue in ocean waves as an explicit game progression rule (not a real-world material claim). Plywood seats remain allowed. Failed boats rank behind finishers, earn no rewards, and cannot win challenge bonuses. Designs remain saved and are reset after the race so players can rebuild; no permanent inventory is destroyed.
