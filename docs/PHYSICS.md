# Physics estimate and calibration backlog

All competitors use the same estimator, geometry rules, and event conditions.

## Geometry and buoyancy

The hull is 5 m long with five editable transverse stations. Each has a width and keel depth. The gunwale is level; flat-bottom or deep-V cross sections set the bottom-width ratio. Adjacent stations produce the rendered hull panels. Panel area is measured from two triangles per quadrilateral; the bow sums three triangular surfaces. Panel mass is area times a provisional areal mass, plus 9 kg for a brace.

Hull, seat shells, transom, engine, cross braces, and a fixed frame/driver allowance contribute to mass. Component positions contribute to lateral and longitudinal mass moments. Seat/transom mass coefficients and material areal masses are game presets, not certified material specifications.

A bisection solves the waterline where integrated submerged cross sections displace the boat's mass. The prototype uses 1025 kg/m³ water density for all courses; fresh/salt density selection remains a calibration improvement. A coarse waterplane inertia estimates initial transverse stability. Missing panels prohibit launch. An 85% gunwale-capacity limit provides a basic reserve-buoyancy check.

## Speed

Available effective propulsion is nominal engine shaft power × 745.7 W/HP × a fixed 0.52 propulsive efficiency.

A speed solver balances effective power against resistance × speed. Resistance includes:

- ITTC-1957 skin friction: Cf = 0.075 / (log10(Re) − 2)², using estimated wetted area and Reynolds number.
- A provisional Froude-number wave-resistance hump.
- A heuristic transition to planing resistance using a fixed lift/drag assumption for each hull family.
- Empirical added wave resistance and a basic headwind drag term.
- Penalties for abrupt station changes and unfavorable mass distribution.

Only the friction relation is an established correlation. The residuary, planing, added-wave, balance, and tuning coefficients are uncalibrated game approximations. This is not CFD, a full Savitsky solver, or a validated vessel performance tool.

Course velocity adds the course's following current to through-water speed. Completion time is course distance divided by estimated course velocity. Acceleration, turns, current shear, propeller matching, ventilation, detailed wave spectra, and maneuvering are not yet simulated.

Head-to-head placing uses estimated finish time. Solo results use speed/appearance/comfort/strength weights appropriate to the event.

## Next calibration work

1. Separate fresh and salt water density and viscosity.
2. Validate displacement and wetted area against analytical hull cases.
3. Compare drag and speed against measured small-craft performance.
4. Add engine torque/RPM curves and propeller selection before presenting tuning gains as physical predictions.
5. Add acceleration, turns, wave encounters, roll response, and local structural stress.
6. Refine mixed-material stiffness, joint loads, panel thickness, and impact failure.
7. Add a wave-aware seaworthiness gate beyond the current buoyancy check.

Reference: [ITTC Resistance Test procedure, friction correlation](https://www.ittc.info/media/11780/75-02-02-01.pdf).
