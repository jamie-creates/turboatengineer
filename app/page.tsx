/* oxlint-disable react/react-compiler -- Effects hydrate and persist device-local state after SSR; this imperative game does not use React Compiler. */
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
import PanelBuilder from './panel-builder';
import MaterialShop from './material-shop';
import EngineShop from './engine-shop';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  initial,
  materials,
  events,
  stats,
  runEvent,
  readSave,
  parseSave,
  type Design,
  type Save,
} from '@/lib/game';
import BoatScene from './boat-scene';
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
      const p = Math.min(100, (performance.now() - start) / 140);
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        const r = pending.current;
        pending.current = null;
        busy.current = false;
        if (r) {
          setResult(r);
          setSave((v) => ({
            ...v,
            credits: v.credits + r.credits,
            xp: v.xp + r.xp,
            races: v.races + 1,
          }));
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
    setSave((v) => ({ ...v, design: { ...v.design, ...p } }));
    setResult(null);
  }
  function launch() {
    if (!ready || busy.current || s.missing || s.unsafe) return;
    busy.current = true;
    pending.current = runEvent(design, eventId, opponentCount, save.xp);
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
      setResult(null);
      setNotice('Your boatyard save has been restored.');
    } catch {
      setNotice('That file is not a valid Turboat Engineer save.');
    }
  }
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
        <Link className="brand" href="/" aria-label="Turboat Engineer home">
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
            />
            <div className="scene-caption">
              <span className="live-dot" />
              {running ? 'RACE IN PROGRESS' : 'HARBOR TEST BASIN'}
            </div>
            <div className="preview-stats">
              <strong>
                {s.knots}
                <small>knots / estimated</small>
              </strong>
              <strong>
                {s.mass}
                <small>kg / total weight</small>
              </strong>
            </div>
            <span className="scene-hint">Drag to orbit · Pinch to zoom</span>
          </div>
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
          {!running && (
            <PanelBuilder
              design={design}
              owned={save.ownedMaterials}
              onDesign={tune}
              disabled={!ready}
            />
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
                  {progress < 30
                    ? 'Leaving the starting line'
                    : progress < 70
                      ? 'Testing your hull through the course'
                      : 'Heading for the finish'}
                </span>
                <b>{Math.round(progress)}%</b>
              </p>
              <Progress value={progress} aria-label="Race progress" />
              {entrants && entrants.opponents.length > 0 && (
                <div className="fleet-list">
                  <span>
                    <i style={{ background: design.color }} />
                    Your boat
                  </span>
                  {entrants.opponents.map((o) => (
                    <span key={o.name}>
                      <i style={{ background: o.design.color }} />
                      {o.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
                  onClick={launch}
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
          )}
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
                    {result.elapsedSeconds % 60}s estimated course time ·{' '}
                    {result.courseKnots}kn over course
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
                          {String(entry.elapsedSeconds % 60).padStart(2, '0')} ·{' '}
                          {entry.courseKnots}kn
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
            </section>
          )}
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
              on this device. Cloud saves are planned.
            </p>
            <p>
              After the first online visit, the installed game can work offline
              once its files are cached. Export a backup before clearing browser
              data.
            </p>
            <button
              className="export"
              onClick={exportSave}
              disabled={!ready || running}
            >
              Export save
            </button>
            <span> · </span>
            <label className="export">
              Import save
              <input
                type="file"
                accept="application/json,.json"
                disabled={!ready || running}
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
            disabled={running || !ready}
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
                setSave(fn);
                setResult(null);
              }}
            />
            <h3>Powerplant</h3>
            <EngineShop
              save={save}
              disabled={running || !ready}
              onChange={(fn) => {
                if (busy.current) return;
                setSave(fn);
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
