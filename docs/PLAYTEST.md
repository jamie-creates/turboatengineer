# Browser playtest — September 9, 2026

Tested the local game through real browser controls in the Codex in-app browser. This supplements the 12 simulation tests, lint, typecheck, and production build; it is not a claim of exhaustive coverage.

## Passed

- Removed an installed panel: sealed sections dropped to 12/13, estimated speed became zero, and launch was disabled. Reinstalled the panel by selecting a tray material and tapping the empty section.
- Widened a hull station with its button, then directly dragged a hull corner inward: station 3 changed from 1.9 m to 1.5 m.
- Purchased steel hull supplies for 120 credits and dragged a steel panel from the tray into section 2. The panel and status message updated correctly.
- Directly dragged station 3's keel node: depth changed from 0.60 m to 0.91 m and the draft estimate changed.
- Bought the Harbor 25 exhaust for 90 credits: balance changed from 360 to 270 and power from 25 to 26 HP.
- Seat shop showed earlier unlock thresholds than hull supplies; steel seats could be purchased independently for 30 credits.
- Launched a race with three generated opponents. The field contained the player plus Reed Runner, Wake Bandit, and Blue Heron. Editing controls were disabled during the race. Finish results ranked four boats and paid 98 credits and 25 reputation for that run.
- Reloaded after purchases and racing: 348 credits, 60 reputation, two completed events, steel section 2, the engine upgrade, and the 0.91 m keel depth persisted.
- Selected all seven courses: event names and water-dependent resistance estimates changed.
- Visually inspected the 3D workshop boat at the tested shape: hull, seats, engine, and dry interior rendered.
- Deployed Azure URL returned HTTP 200, loaded the game UI, and responded to adding a cross brace.

## Not yet verified

- Export save was clicked, but the downloaded file and an import round-trip were not verified.
- Physical iPhone/iPad dragging, pinch zoom, Home Screen installation, and offline restart.
- Exhaustive material/engine combinations, progression through every unlock, and all race/opponent-count combinations.
- Water masking across all camera angles and extreme hull shapes.
- Long sessions, multiple tabs, interrupted races, storage exhaustion, and save conflicts.
- Cloud login and cloud saves are not implemented.

The production deployment succeeded at https://red-river-0895c9d1e.5.azurestaticapps.net/. Custom-domain DNS has not been changed. Keep anemkai.com pending until the user is ready for that cutover.
