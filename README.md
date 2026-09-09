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
