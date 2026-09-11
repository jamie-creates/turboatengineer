/* oxlint-disable react/react-compiler -- Effects hydrate and persist device-local state after SSR; this imperative game does not use React Compiler. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG is the accessible live course visualization. */
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Anchor,
  ArrowRight,
  Flag,
  Gauge,
  Shield,
  Sparkles,
  Waves,
  Trophy,
} from 'lucide-react';
import PanelBuilder from '../panel-builder';
import MaterialShop from '../material-shop';
import EngineShop from '../engine-shop';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  initial,
  materials,
  panelWeight,
  events,
  stats,
  runEvent,
  raceFrame,
  simulateRace,
  coursePoint,
  readSave,
  parseSave,
  type Design,
  type Save,
} from '@/lib/game';
import BoatScene from '../boat-scene';
import {
  seaTrial,
  career,
  careerEligible,
  careerRace,
  completeCareer,
} from '@/lib/workshop';
import Garage from '../garage';
import CloudSave from '../cloud-save';
const labels = ['Speed', 'Appearance', 'Comfort', 'Strength'],
  icons = [Gauge, Sparkles, Waves, Shield];
const key = 'turboat-save-v2',
  colors = [
    { name: 'Amber', value: '#f5a524' },
    { name: 'Ocean', value: '#39b9b3' },
    { name: 'Coral', value: '#e66d54' },
    { name: 'Ivory', value: '#e9eade' },
  ];
type Result = ReturnType<typeof runEvent>;
export default function Home() {
  const [selectedPanel, setSelectedPanel] = useState(13);
  const [edit3d, setEdit3d] = useState(false);
  const [testing, setTesting] = useState(false);
  const [throttle, setThrottle] = useState(0.65);
  const [trialDone, setTrialDone] = useState(false);
  const [history, setHistory] = useState<{ past: Design[]; future: Design[] }>({
    past: [],
    future: [],
  });
  const editStart = useRef<Design | null>(null);
  const activeChallenge = useRef<string | null>(null);
  const racedDesign = useRef<Design | null>(null);
  const racedEvent = useRef(0);
  const [comparison, setComparison] = useState<Save['lastRun']>();
  const [save, setSave] = useState<Save>(initial),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(''),
    [eventId, setEvent] = useState(0);
  const [opponentCount, setOpponentCount] = useState(0),
    [entrants, setEntrants] = useState<ReturnType<typeof runEvent> | null>(
      null,
    );
  const [running, setRunning] = useState(false),
    [progress, setProgress] = useState(0),
    [result, setResult] = useState<Result | null>(null);
  const pending = useRef<Result | null>(null),
    busy = useRef(false),
    latest = useRef(save);
  useEffect(() => {
    latest.current = save;
  }, [save]);
  const design = save.design,
    event = events[eventId],
    s = stats(design, event.waves, event.wind);
  useEffect(() => {
    try {
      setSave(readSave(localStorage.getItem(key)));
    } catch {
      setNotice(
        'Device storage is unavailable. Export your save before leaving.',
      );
    }
    setReady(true);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production')
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() =>
          setNotice(
            'Offline setup failed. The game is still available while online.',
          ),
        );
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(save));
    } catch {
      setNotice(
        'Could not save on this device. Export your progress before leaving.',
      );
    }
  }, [save, ready]);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const p = Math.min(100, (performance.now() - start) / 280);
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        const r = pending.current;
        pending.current = null;
        busy.current = false;
        if (r) {
          setResult(r);
          setSave((v) =>
            completeCareer(
              {
                ...v,
                credits: v.credits + r.credits,
                xp: v.xp + r.xp,
                races: v.races + 1,
                lastRun: {
                  design: racedDesign.current!,
                  eventId: racedEvent.current,
                  elapsedSeconds: r.elapsedSeconds,
                },
              },
              activeChallenge.current,
              r.place,
            ),
          );
        }
        setRunning(false);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context) return;
    const life = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'inspect_boat_design',
            description:
              'Read the current boat design, owned parts, and progression.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: unknown) => {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).length
              )
                throw new Error('Expected an empty object');
              return structuredClone(latest.current);
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => life.abort();
  }, []);
  function tune(p: Partial<Design>) {
    if (busy.current) return;
    const previous = latest.current.design;
    const nextDesign = { ...previous, ...p };
    if (JSON.stringify(previous) === JSON.stringify(nextDesign)) return;
    if (!editStart.current)
      setHistory((h) => ({
        past: [...h.past.slice(-49), previous],
        future: [],
      }));
    latest.current = { ...latest.current, design: nextDesign };
    setSave(latest.current);
    setResult(null);
    setTrialDone(false);
  }
  function beginEdit() {
    editStart.current ??= structuredClone(latest.current.design);
  }
  function endEdit() {
    const before = editStart.current;
    editStart.current = null;
    if (
      before &&
      JSON.stringify(before) !== JSON.stringify(latest.current.design)
    )
      setHistory((h) => ({ past: [...h.past.slice(-49), before], future: [] }));
  }
  function travelHistory(redo: boolean) {
    if (busy.current) return;
    const source = redo ? history.future : history.past;
    const target = source.at(-1);
    if (!target) return;
    const current = latest.current.design;
    const restored = { ...target, engineMods: current.engineMods };
    setHistory(
      redo
        ? { past: [...history.past, current], future: source.slice(0, -1) }
        : { past: source.slice(0, -1), future: [...history.future, current] },
    );
    latest.current = { ...latest.current, design: restored };
    setSave(latest.current);
    setResult(null);
    setTrialDone(false);
  }
  function launch(challengeId: string | null = null) {
    if (!ready || busy.current || s.missing || s.unsafe) return;
    busy.current = true;
    activeChallenge.current = challengeId;
    const challenge = career.find((c) => c.id === challengeId);
    racedEvent.current = challenge?.eventId ?? eventId;
    racedDesign.current = structuredClone(design);
    setComparison(save.lastRun);
    if (challenge) setEvent(challenge.eventId);
    pending.current = challenge
      ? careerRace(save, challenge.id)
      : runEvent(design, eventId, opponentCount, save.xp);
    setEntrants(pending.current);
    setResult(null);
    setProgress(0);
    setRunning(true);
  }
  function exportSave() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turboat-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importSave(file?: File) {
    if (!file || busy.current) return;
    if (file.size > 100000) {
      setNotice('That file is too large to be a boatyard save.');
      return;
    }
    try {
      const restored = parseSave(await file.text());
      if (busy.current) return;
      setSave(restored);
      latest.current = restored;
      setHistory({ past: [], future: [] });
      setResult(null);
      setNotice('Your boatyard save has been restored.');
    } catch {
      setNotice('That file is not a valid Turboat Engineer save.');
    }
  }
  const raceTime = entrants
    ? (Math.max(
        entrants.elapsedSeconds,
        ...entrants.opponents.map((o) => o.elapsedSeconds),
      ) *
        progress) /
      100
    : 0;
  const liveFrame =
    entrants && running ? raceFrame(entrants.dynamics, raceTime) : null;
  const fleet = entrants
    ? [
        { name: 'Your boat', color: design.color, dynamics: entrants.dynamics },
        ...entrants.opponents.map((o) => ({
          name: o.name,
          color: o.design.color,
          dynamics: o.dynamics,
        })),
      ]
        .map((o) => ({ ...o, frame: raceFrame(o.dynamics, raceTime) }))
        .sort(
          (a, b) =>
            b.frame.distance - a.frame.distance ||
            a.dynamics.duration - b.dynamics.duration,
        )
    : [];
  const trackPoints = Array.from({ length: 101 }, (_, i) =>
    coursePoint((event.distance * i) / 100, eventId),
  );
  const mapMinX = Math.min(...trackPoints.map((p) => p.x)),
    mapMinZ = Math.min(...trackPoints.map((p) => p.z));
  const mapScale =
    130 /
    Math.max(
      1,
      ...trackPoints.map((p) => p.x - mapMinX),
      ...trackPoints.map((p) => p.z - mapMinZ),
    );
  const mapPosition = (distance: number) => {
    const p = coursePoint(distance, eventId);
    return {
      x: 15 + (p.x - mapMinX) * mapScale,
      y: 145 - (p.z - mapMinZ) * mapScale,
    };
  };
  const next = [...materials]
      .sort((a, b) => a.xp - b.xp)
      .find((m) => m.xp > save.xp),
    rank =
      save.xp >= 400
        ? 'ELITE'
        : save.xp >= 120
          ? 'CLUB'
          : save.xp >= 60
            ? 'APPRENTICE'
            : 'ROOKIE';
  return (
    <main className="yard">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Anemkai game library">
          <Anchor size={25} />
          <span>
            TURBOAT<span className="brand-light"> ENGINEER</span>
          </span>
        </Link>
        <span className="edition">BUILD / RACE / REFINE</span>
        <div className="wallet">
          {save.credits.toLocaleString()} <span>credits</span>
        </div>
      </header>
      {notice && <output className="notice">{notice}</output>}
      <div className="workspace">
        <section className="main-deck">
          <div className="section-title">
            <div>
              <p className="eyebrow">
                {running
                  ? 'ON THE WATER'
                  : save.races
                    ? 'BUILD NO. 01 / YOUR RUNABOUT'
                    : 'YOUR FIRST BUILD'}
              </p>
              <h1>{running ? event.name : 'The workshop'}</h1>
            </div>
            <span className="badge">{rank} BOATYARD</span>
          </div>
          <div className="boat-view">
            <BoatScene
              design={design}
              running={running}
              waves={event.waves}
              entrants={entrants}
              progress={progress}
              editMode={edit3d && !running && !testing && ready}
              selectedPanel={selectedPanel}
              onSelectPanel={setSelectedPanel}
              onDesign={tune}
              onEditStart={beginEdit}
              onEditEnd={endEdit}
              trial={
                testing
                  ? seaTrial(design, event.waves, event.wind, throttle)
                  : null
              }
            />
            <div className="scene-caption">
              <span className="live-dot" />
              {running
                ? 'RACE IN PROGRESS'
                : testing
                  ? 'SEA TRIAL · ' + event.name
                  : 'BOATYARD'}
            </div>
            <div className="preview-stats">
              <strong>
                {liveFrame
                  ? (liveFrame.speed * 1.94384).toFixed(1)
                  : testing
                    ? seaTrial(
                        design,
                        event.waves,
                        event.wind,
                        throttle,
                      ).speed.toFixed(1)
                    : s.knots}
                <small>knots / estimated</small>
              </strong>
              <strong>
                {s.mass}
                <small>kg / total weight</small>
              </strong>
            </div>
            <span className="scene-hint">
              {edit3d && !testing && !running
                ? 'Tap a panel · Pull gold width / blue depth handles'
                : 'Drag to orbit · Pinch to zoom'}
            </span>
          </div>
          <fieldset
            className="workshop-tools"
            disabled={!ready || running || testing}
          >
            <button aria-pressed={edit3d} onClick={() => setEdit3d(!edit3d)}>
              {edit3d ? 'Finish 3D editing' : 'Edit panels in 3D'}
            </button>
            <button
              disabled={!history.past.length}
              onClick={() => travelHistory(false)}
            >
              Undo
            </button>
            <button
              disabled={!history.future.length}
              onClick={() => travelHistory(true)}
            >
              Redo
            </button>
          </fieldset>
          {edit3d && !running && !testing && (
            <p className="engineering-readout" aria-live="polite">
              Section {selectedPanel + 1} · Station{' '}
              {Math.floor(selectedPanel / 3) + 1} ·{' '}
              {(design.widths[Math.floor(selectedPanel / 3)] / 50).toFixed(2)} m
              wide · {design.depths[Math.floor(selectedPanel / 3)].toFixed(2)} m
              deep · {panelWeight(design, selectedPanel).toFixed(1)} kg panel
            </p>
          )}
          {!running && (
            <section className="trial-panel">
              <h2>Sea trial</h2>
              <p>
                Free practice in {event.name}. No rewards, damage, or entry
                cost.
              </p>
              <button
                className="primary"
                disabled={!ready || !!s.missing || s.unsafe}
                onClick={() => {
                  if (testing) {
                    setTesting(false);
                    busy.current = false;
                    setTrialDone(true);
                  } else {
                    busy.current = true;
                    setTesting(true);
                    setEntrants(null);
                    setEdit3d(false);
                    setResult(null);
                  }
                }}
              >
                {testing ? 'Return to workshop' : 'Take a test run'}
              </button>
              {testing && (
                <label>
                  Throttle · {Math.round(throttle * 100)}%
                  <input
                    aria-label="Test run throttle"
                    type="range"
                    min="0"
                    max="100"
                    value={throttle * 100}
                    onChange={(e) => setThrottle(Number(e.target.value) / 100)}
                  />
                </label>
              )}
              {(testing || trialDone) && (
                <>
                  <div className="trial-meters">
                    {(() => {
                      const t = seaTrial(
                        design,
                        event.waves,
                        event.wind,
                        throttle,
                      );
                      return (
                        <>
                          <span>
                            <b>{t.speed.toFixed(1)} kn</b> estimated speed
                          </span>
                          <span>
                            <b>{Math.abs(t.heel).toFixed(1)}°</b> heel
                          </span>
                          <span>
                            <b>{Math.round(t.impact)}/100</b> wave impact
                          </span>
                          <span>
                            <b>{t.freeboard.toFixed(2)} m</b> freeboard
                          </span>
                          <span>
                            <b>{Math.round(t.strain)}/100</b> mount strain
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <ul>
                    {seaTrial(
                      design,
                      event.waves,
                      event.wind,
                      throttle,
                    ).warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <p className="weight-note">
                    Motion and load indicators are engineering estimates, not
                    measured damage or a full wave simulation.
                  </p>
                </>
              )}
            </section>
          )}
          <div className="score-strip">
            {s.scores.map((v, i) => {
              const Icon = icons[i];
              return (
                <div key={labels[i]}>
                  <div className="score-label">
                    <Icon size={17} />
                    {labels[i]}
                    <b>{v}</b>
                  </div>
                  <Progress value={v} aria-label={labels[i]} />
                </div>
              );
            })}
          </div>
          <div className="engineering-readout">
            <span>
              <b>{13 - s.missing}/13</b> sealed sections
            </span>
            <span>
              <b>{Math.abs(s.lateral)}%</b>{' '}
              {s.lateral < 0 ? 'port' : s.lateral > 0 ? 'starboard' : 'lateral'}{' '}
              offset
            </span>
            <span>
              <b>{Math.abs(s.trim)}%</b> {s.trim <= 0 ? 'aft' : 'forward'} trim
            </span>
            <span>
              <b>{s.engineSupported ? 'Braced' : 'Unbraced'}</b> engine mount
            </span>
          </div>
          {!running && !testing && (
            <div
              onPointerDownCapture={beginEdit}
              onPointerUpCapture={endEdit}
              onPointerCancelCapture={endEdit}
            >
              <PanelBuilder
                design={design}
                owned={save.ownedMaterials}
                onDesign={tune}
                disabled={!ready}
                selected={selectedPanel}
                onSelect={setSelectedPanel}
              />
            </div>
          )}
          {s.missing > 0 && (
            <output className="notice">
              Close {s.missing} open hull section{s.missing === 1 ? '' : 's'}{' '}
              before launching.
            </output>
          )}
          {running ? (
            <div className="race-progress">
              <p>
                <span>
                  {liveFrame?.phase} · {Math.round(liveFrame?.distance || 0)} /{' '}
                  {event.distance} m
                </span>
                <b>{Math.round(progress)}% · accelerated replay</b>
              </p>
              <Progress value={progress} aria-label="Race progress" />
              <div className="race-telemetry">
                <svg
                  viewBox="0 0 160 160"
                  role="img"
                  aria-label="Race course map showing boat positions"
                >
                  <polyline
                    points={trackPoints
                      .map((_, i) => {
                        const p = mapPosition((event.distance * i) / 100);
                        return `${p.x},${p.y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#819f9e"
                    strokeWidth="5"
                  />
                  {fleet.map((boat) => {
                    const p = mapPosition(boat.frame.distance);
                    return (
                      <circle
                        key={boat.name}
                        cx={p.x}
                        cy={p.y}
                        r={boat.name === 'Your boat' ? 5 : 4}
                        fill={boat.color}
                        stroke="#123d43"
                        strokeWidth="1"
                      >
                        <title>{boat.name}</title>
                      </circle>
                    );
                  })}
                </svg>
                <ol>
                  {fleet.map((boat) => (
                    <li key={boat.name}>
                      <b>{boat.name}</b>
                      <span>
                        {boat.frame.phase === 'Finished'
                          ? 'Finished'
                          : `${(boat.frame.speed * 1.94384).toFixed(1)} kn · ${boat.frame.phase}`}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              {entrants && entrants.opponents.length > 0 && (
                <div className="fleet-list">
                  <span>
                    <i style={{ background: design.color }} />
                    Your boat
                  </span>
                  {entrants.opponents.map((o) => (
                    <span key={o.name}>
                      <i style={{ background: o.design.color }} />
                      {o.name} · {o.style}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : !testing ? (
            <>
              <div className="event-picker" aria-label="Choose an event">
                {events.map((e, i) => (
                  <button
                    key={e.name}
                    aria-pressed={eventId === i}
                    className={eventId === i ? 'selected' : ''}
                    onClick={() => {
                      setEvent(i);
                      setResult(null);
                    }}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
              <div className="opponent-picker">
                <p className="eyebrow">RACE AGAINST</p>
                <RadioGroup
                  value={String(opponentCount)}
                  onValueChange={(v) => {
                    setOpponentCount(Number(v));
                    setResult(null);
                  }}
                  aria-label="Number of computer opponents"
                  className="opponent-options"
                >
                  {[0, 1, 2, 3].map((n) => (
                    <label key={n}>
                      <RadioGroupItem value={String(n)} />
                      {n === 0 ? 'Solo' : n + ' boat' + (n === 1 ? '' : 's')}
                    </label>
                  ))}
                </RadioGroup>
                <p>
                  Fresh computer-built boats each race. Maximum 3 opponents.
                </p>
              </div>
              <div className="event-panel">
                <div>
                  <p className="eyebrow">
                    FREE ENTRY / UP TO {event.reward} CREDITS
                  </p>
                  <h2>{event.name}</h2>
                  <p>{event.description}</p>
                </div>
                <button
                  className="primary"
                  disabled={!ready || s.missing > 0 || s.unsafe}
                  onClick={() => launch()}
                >
                  <Flag size={18} /> Launch race <ArrowRight size={18} />
                </button>
              </div>
              <p className="weight-note">
                Judging:{' '}
                {event.weights
                  .map(
                    (w, i) =>
                      Math.round(w * 100) + '% ' + labels[i].toLowerCase(),
                  )
                  .join(' · ')}
              </p>
            </>
          ) : null}
          <details className="physics-details">
            <summary>
              Physics estimate · {s.physics.draft.toFixed(2)}m draft ·{' '}
              {s.physics.dragNewtons}N resistance
            </summary>
            <p>
              {event.waves}m significant wave height ·{' '}
              {(event.wind * 1.94384).toFixed(1)}kn headwind · {event.current}
              m/s following current.
            </p>
            <p>
              {s.physics.freeboard.toFixed(2)}m estimated freeboard ·{' '}
              {s.physics.capacity.toFixed(0)}kg buoyancy at the gunwale ·{' '}
              {s.physics.effectivePower}kW effective propulsion.
            </p>
            <p>
              Speed solves engine power against estimated friction, wave-making,
              planing, and wind resistance. Buoyancy is calculated from the
              panel geometry. The drag and material models are approximate and
              uncalibrated; this is not a naval-design safety tool.
            </p>
          </details>
          {s.unsafe && (
            <p className="notice">
              This hull needs more buoyancy. Widen or deepen the hull, or fit
              lighter components, before launching.
            </p>
          )}{' '}
          {result && (
            <section className="result" aria-live="polite">
              <div className="result-heading">
                <Trophy size={30} />
                <strong>
                  {['1st', '2nd', '3rd', '4th'][result.place - 1]}
                </strong>
                <div>
                  <h2>
                    {result.opponents.length
                      ? 'of ' + (result.opponents.length + 1) + ' boats'
                      : result.score + '/100 overall'}
                  </h2>
                  <p>
                    {Math.floor(result.elapsedSeconds / 60)}m{' '}
                    {Math.floor(result.elapsedSeconds % 60)}s simulated course
                    time · {result.courseKnots}kn over course
                  </p>
                  <p>
                    +{result.credits} credits · +{result.xp} reputation
                  </p>
                </div>
              </div>
              <p className="weight-note">
                {result.opponents.length
                  ? 'Head-to-head placing uses estimated finish time. Your four-category design score: ' +
                    result.score +
                    '/100.'
                  : 'Solo placing combines all four scores using this event\u0027s judging weights.'}
              </p>
              {result.opponents.length > 0 && (
                <div className="standings">
                  <h3>Finish order</h3>
                  <ol>
                    {result.standings.map((entry, i) => (
                      <li
                        key={entry.name}
                        className={entry.isPlayer ? 'player-result' : ''}
                      >
                        <span>
                          <b>{i + 1}.</b>{' '}
                          <i style={{ background: entry.color }} />
                          {entry.name}
                        </span>
                        <span>
                          {Math.floor(entry.elapsedSeconds / 60)}:
                          {String(
                            Math.floor(entry.elapsedSeconds % 60),
                          ).padStart(2, '0')}{' '}
                          · {entry.courseKnots}kn
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <ul>
                {result.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <h3>What happened on the course</h3>
              <ul>
                <li>
                  {result.dynamics.accelerationSeconds
                    ? `Reached 90% of cruising speed in ${result.dynamics.accelerationSeconds} seconds. Less weight or more engine power improves the launch.`
                    : 'The boat never reached 90% of cruising speed between bends and waves.'}
                </li>
                <li>
                  Average corner speed was {result.dynamics.turnLoss}% below
                  fast straight sections. Balanced weight and smooth hull lines
                  help retain speed.
                </li>
                <li>
                  {result.dynamics.impactSeconds > 2
                    ? 'Wave impacts repeatedly interrupted acceleration. A deep-V hull reduces these impacts.'
                    : 'Wave interruptions were small on this run.'}
                </li>
              </ul>
              <h3>What this build taught us</h3>
              <ul>
                {seaTrial(design, event.waves, event.wind).warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              {comparison && (
                <div className="build-comparison">
                  <h3>Compared with your previous raced design</h3>
                  <p>
                    Both hulls estimated in {event.name} conditions, so a course
                    change does not distort the comparison.
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Measure</th>
                        <th>Previous</th>
                        <th>This build</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Simulated course time</td>
                        <td>
                          {simulateRace(
                            comparison.design,
                            eventId,
                          ).duration.toFixed(1)}{' '}
                          s
                        </td>
                        <td>{result.elapsedSeconds.toFixed(1)} s</td>
                      </tr>
                      <tr>
                        <td>Weight</td>
                        <td>{stats(comparison.design).mass} kg</td>
                        <td>{s.mass} kg</td>
                      </tr>
                      <tr>
                        <td>Speed</td>
                        <td>
                          {
                            stats(comparison.design, event.waves, event.wind)
                              .knots
                          }{' '}
                          kn
                        </td>
                        <td>{s.knots} kn</td>
                      </tr>
                      <tr>
                        <td>Wave impact</td>
                        <td>
                          {Math.round(
                            seaTrial(comparison.design, event.waves, event.wind)
                              .impact,
                          )}
                        </td>
                        <td>
                          {Math.round(
                            seaTrial(design, event.waves, event.wind).impact,
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <p className="weight-note">
                Acceleration, bends and wave impacts use the same model as the
                replay. Collisions and manual steering are not simulated.
              </p>
            </section>
          )}
          <section className="career-panel">
            <h2>Your racing career</h2>
            <p>Meet returning rivals. Challenge bonuses are awarded once.</p>
            {career.map((c) => (
              <article key={c.id}>
                <p className="eyebrow">{c.className}</p>
                <h3>
                  {c.name} · {c.rival}
                </h3>
                <p>“{c.quote}”</p>
                <p>{c.goal}</p>
                <p>
                  {c.xp} reputation to enter · bonus {c.reward} credits +{' '}
                  {c.reputation} reputation
                </p>
                <button
                  disabled={
                    !ready ||
                    running ||
                    testing ||
                    s.unsafe ||
                    !!s.missing ||
                    !careerEligible(save, c.id)
                  }
                  onClick={() => launch(c.id)}
                >
                  {save.challenges?.includes(c.id)
                    ? 'Replay challenge · bonus earned'
                    : 'Enter challenge'}
                </button>
              </article>
            ))}
          </section>
          <Garage
            save={save}
            disabled={!ready || running || testing}
            onChange={(v) => {
              latest.current = v;
              setSave(v);
              setHistory({ past: [], future: [] });
              setResult(null);
            }}
          />
          <CloudSave
            save={save}
            disabled={!ready || running || testing}
            onRestore={(v) => {
              latest.current = v;
              setSave(v);
              setHistory({ past: [], future: [] });
              setResult(null);
            }}
          />
          <div className="rank-progress">
            <p>
              {save.xp} reputation · {save.races} events completed
              {next
                ? ' · ' + next.name + ' unlocks at ' + next.xp
                : ' · All materials unlocked'}
            </p>
            <Progress
              value={Math.min(100, (save.xp / (next?.xp || 400)) * 100)}
              aria-label="Progress toward next material"
            />
          </div>
          <details className="install">
            <summary>Install & save your boatyard</summary>
            <p>
              On iPhone or iPad, open the published game in Safari, use Share,
              then Add to Home Screen. Progress currently stays in this browser
              on this device. Use Save across devices below to upload or restore
              cloud progress.
            </p>
            <p>
              After the first online visit, the installed game can work offline
              once its files are cached. Export a backup before clearing browser
              data.
            </p>
            <button
              className="export"
              onClick={exportSave}
              disabled={!ready || running || testing}
            >
              Export save
            </button>
            <span> · </span>
            <label className="export">
              Import save
              <input
                type="file"
                accept="application/json,.json"
                disabled={!ready || running || testing}
                onChange={(e) => {
                  void importSave(e.target.files?.[0]);
                  e.target.value = '';
                }}
                style={{ display: 'block', fontSize: 13, maxWidth: '100%' }}
              />
            </label>
          </details>
        </section>
        <aside className="build-panel">
          <fieldset
            disabled={running || testing || !ready}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
            <p className="eyebrow">01 / HULL & MATERIAL</p>
            <h2>Make it yours.</h2>
            <div className="choices">
              {(['skiff', 'v'] as const).map((h) => (
                <button
                  key={h}
                  aria-pressed={design.hull === h}
                  className={design.hull === h ? 'selected' : ''}
                  onClick={() => tune({ hull: h })}
                >
                  {h === 'skiff' ? 'Flat-bottom' : 'Deep-V'}
                  <small>
                    {h === 'skiff' ? 'Fast on calm water' : 'Smoother in waves'}
                  </small>
                </button>
              ))}
            </div>
            <h3>Material shop</h3>
            <MaterialShop
              save={save}
              disabled={running || !ready}
              onChange={(fn) => {
                if (busy.current) return;
                latest.current = fn(latest.current);
                setSave(latest.current);
                setHistory({ past: [], future: [] });
                setResult(null);
              }}
            />
            <h3>Powerplant</h3>
            <EngineShop
              save={save}
              disabled={running || !ready}
              onChange={(fn) => {
                if (busy.current) return;
                latest.current = fn(latest.current);
                setSave(latest.current);
                setHistory({ past: [], future: [] });
                setResult(null);
              }}
            />{' '}
            <h3>Surface finish</h3>
            <div className="choices">
              {[60, 90].map((f) => (
                <button
                  key={f}
                  aria-pressed={design.finish === f}
                  className={design.finish === f ? 'selected' : ''}
                  onClick={() => tune({ finish: f })}
                >
                  {f === 60 ? 'Workboat' : 'Polished'}
                </button>
              ))}
            </div>
            <h3>Accent paint</h3>
            <div className="swatches">
              {colors.map((c) => (
                <button
                  key={c.value}
                  aria-label={c.name + ' paint'}
                  aria-pressed={design.color === c.value}
                  className={design.color === c.value ? 'selected' : ''}
                  style={{ background: c.value }}
                  onClick={() => tune({ color: c.value })}
                />
              ))}
            </div>
            <p className="build-note">
              Buy a material supply to add its panels to the engineering bench.
              Place each panel individually. Hull shaping, cross braces, and
              paint are free in this prototype.
            </p>
          </fieldset>
        </aside>
      </div>
      <footer>
        TURBOAT ENGINEER · PROTOTYPE 01
        <span>Designed for touch. Built for tinkering.</span>
      </footer>
    </main>
  );
}
