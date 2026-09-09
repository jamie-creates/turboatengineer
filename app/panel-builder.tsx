/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG keel handles expose slider semantics with pointer and keyboard controls. */
'use client';
import { useRef, useState } from 'react';
import { Move, Plus, Minus, Wrench, Trash2 } from 'lucide-react';
import { materials, slots, panelWeight, type Design } from '@/lib/game';
type Tool =
  | { kind: 'panel'; material: number }
  | { kind: 'engine' }
  | { kind: 'select' };
type Drag = {
  tool: Tool | { kind: 'move'; from: number };
  x: number;
  y: number;
  startX: number;
  startY: number;
  moved: boolean;
};
export default function PanelBuilder({
  design,
  owned,
  onDesign,
  disabled,
}: {
  design: Design;
  owned: number[];
  onDesign: (d: Partial<Design>) => void;
  disabled: boolean;
}) {
  const [tool, setTool] = useState<Tool>({ kind: 'select' }),
    [selected, setSelected] = useState(13),
    [ghost, setGhost] = useState<Drag | null>(null),
    [message, setMessage] = useState(
      'Drag a material onto a hull section. Tap a material, then a section, also works.',
    );
  const drag = useRef<Drag | null>(null),
    suppress = useRef(false);
  const shapeDrag = useRef<{
    row: number;
    axis: 'width' | 'depth';
    x: number;
    y: number;
    value: number;
    scale: number;
    side: number;
  } | null>(null);
  function shapeStart(
    e: React.PointerEvent,
    row: number,
    axis: 'width' | 'depth',
    side = 1,
  ) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const parent = e.currentTarget.closest(
      axis === 'width' ? '.station' : '.depth-profile',
    );
    const scale =
      axis === 'width'
        ? 100 /
          Math.max(1, (parent?.getBoundingClientRect().width || 400) - 140)
        : (1 / (parent?.getBoundingClientRect().height || 190)) * 1.9;
    shapeDrag.current = {
      row,
      axis,
      x: e.clientX,
      y: e.clientY,
      value: axis === 'width' ? design.widths[row] : design.depths[row],
      scale,
      side,
    };
  }
  function shapeMove(e: React.PointerEvent) {
    const drag = shapeDrag.current;
    if (!drag) return;
    e.stopPropagation();
    if (drag.axis === 'width') {
      const widths = design.widths.slice();
      widths[drag.row] = Math.max(
        25,
        Math.min(
          100,
          Math.round(
            drag.value + (e.clientX - drag.x) * drag.scale * 2 * drag.side,
          ),
        ),
      );
      onDesign({ widths });
    } else {
      const depths = design.depths.slice();
      depths[drag.row] = Math.max(
        0.25,
        Math.min(
          1.2,
          Math.round((drag.value + (e.clientY - drag.y) * drag.scale) * 100) /
            100,
        ),
      );
      onDesign({ depths });
    }
  }
  const shapeEvents = {
    onPointerMove: shapeMove,
    onPointerUp: () => {
      shapeDrag.current = null;
    },
    onPointerCancel: () => {
      shapeDrag.current = null;
    },
  };
  function place(t: Drag['tool'], slot: number) {
    if (disabled || !slots.includes(slot)) return;
    if (t.kind === 'panel') {
      const panels = design.panels.slice();
      panels[slot] = { material: t.material, braced: false };
      onDesign({ panels });
      setMessage(
        materials[t.material].name +
          ' panel fitted to section ' +
          (slot + 1) +
          '.',
      );
    }
    if (t.kind === 'engine') {
      onDesign({ engineSlot: slot });
      setMessage('Engine moved to section ' + (slot + 1) + '.');
    }
    if (t.kind === 'move' && t.from !== slot) {
      const panels = design.panels.slice();
      [panels[t.from], panels[slot]] = [panels[slot], panels[t.from]];
      onDesign({ panels });
      setMessage(
        'Panels exchanged between sections ' +
          (t.from + 1) +
          ' and ' +
          (slot + 1) +
          '.',
      );
    }
    setSelected(slot);
  }
  function begin(e: React.PointerEvent, t: Drag['tool']) {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      tool: t,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  }
  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved = d.moved || Math.hypot(d.x - d.startX, d.y - d.startY) > 7;
    if (d.moved) setGhost({ ...d });
  }
  function end(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    if (!d?.moved) return;
    suppress.current = true;
    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-panel-slot]');
    if (target) place(d.tool, Number(target.getAttribute('data-panel-slot')));
    else setMessage('Drop onto a numbered hull section.');
    setTimeout(() => {
      suppress.current = false;
    }, 0);
  }
  const pointer = {
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: () => {
      drag.current = null;
      setGhost(null);
    },
  };
  const panel = design.panels[selected];
  return (
    <section className="panel-builder">
      <div className="builder-heading">
        <div>
          <p className="eyebrow">ENGINEERING BENCH</p>
          <h2>Build the hull, panel by panel.</h2>
        </div>
        <span className="badge">5 STATIONS / 13 PANELS</span>
      </div>
      <p className="builder-instruction">
        Drag panels into the frame. Change each station&apos;s width to shape
        the hull. Select a section to inspect or reinforce it.
      </p>
      <div className="parts-tray" aria-label="Draggable parts">
        <button
          className={tool.kind === 'select' ? 'active' : ''}
          onClick={() => setTool({ kind: 'select' })}
          disabled={disabled}
        >
          <Move size={17} /> Select / move
        </button>
        {owned.map((i) => (
          <button
            key={i}
            disabled={disabled}
            className={
              tool.kind === 'panel' && tool.material === i ? 'active' : ''
            }
            onClick={() => {
              if (!suppress.current) setTool({ kind: 'panel', material: i });
            }}
            onPointerDown={(e) => begin(e, { kind: 'panel', material: i })}
            {...pointer}
          >
            <span
              style={{ background: materials[i].color }}
              className="tray-chip"
            />
            {materials[i].name} panel
          </button>
        ))}
        <button
          disabled={disabled}
          className={tool.kind === 'engine' ? 'active' : ''}
          onClick={() => {
            if (!suppress.current) setTool({ kind: 'engine' });
          }}
          onPointerDown={(e) => begin(e, { kind: 'engine' })}
          {...pointer}
        >
          <Wrench size={17} /> Engine
        </button>
      </div>
      <div className="blueprint-layout">
        <div className="blueprint">
          <p className="bow-label">BOW / FRONT ↑</p>
          {Array.from({ length: 5 }, (_, row) => (
            <div className="station" key={row}>
              <span className="station-number">S{row + 1}</span>
              <div
                className="station-panels"
                style={{ width: Math.max(30, design.widths[row]) + '%' }}
              >
                {[-1, 1].map((side) => (
                  <button
                    key={side}
                    disabled={disabled}
                    className={
                      'shape-handle ' + (side === -1 ? 'left' : 'right')
                    }
                    aria-label={'Drag station ' + (row + 1) + ' hull corner'}
                    onPointerDown={(e) => shapeStart(e, row, 'width', side)}
                    {...shapeEvents}
                    onKeyDown={(e) => {
                      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
                      e.preventDefault();
                      const widths = design.widths.slice();
                      widths[row] = Math.max(
                        25,
                        Math.min(
                          100,
                          widths[row] +
                            (e.key === 'ArrowRight' ? 5 : -5) * side,
                        ),
                      );
                      onDesign({ widths });
                    }}
                  />
                ))}
                {(row === 0 ? [1] : [0, 1, 2]).map((col) => {
                  const i = row * 3 + col,
                    p = design.panels[i];
                  if (!slots.includes(i)) return <span key={i} />;
                  return (
                    <button
                      type="button"
                      key={i}
                      data-panel-slot={i}
                      disabled={disabled}
                      aria-label={
                        'Section ' +
                        (i + 1) +
                        ', ' +
                        (p
                          ? materials[p.material].name +
                            (p.braced ? ', braced' : '')
                          : 'empty') +
                        (design.engineSlot === i ? ', engine' : '')
                      }
                      aria-pressed={selected === i}
                      style={{
                        gridColumn: row === 0 ? '1 / -1' : undefined,
                        background: p
                          ? materials[p.material].color + 'cc'
                          : 'transparent',
                      }}
                      className={
                        'hull-cell ' +
                        (p ? 'filled' : 'empty') +
                        (selected === i ? ' picked' : '')
                      }
                      onPointerDown={(e) => {
                        if (tool.kind === 'select' && p)
                          begin(e, { kind: 'move', from: i });
                      }}
                      {...pointer}
                      onClick={() => {
                        if (suppress.current) return;
                        place(tool, i);
                      }}
                    >
                      <span>{i + 1}</span>
                      {p?.braced && (
                        <b className="brace-mark" aria-hidden="true">
                          ╳
                        </b>
                      )}
                      {design.engineSlot === i && (
                        <Wrench size={19} aria-hidden="true" />
                      )}
                      {!p && <Plus size={16} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              <div className="station-width">
                <button
                  aria-label={'Narrow station ' + (row + 1)}
                  disabled={disabled || design.widths[row] <= 25}
                  onClick={() => {
                    const widths = design.widths.slice();
                    widths[row] = Math.max(25, widths[row] - 10);
                    onDesign({ widths });
                  }}
                >
                  <Minus size={13} />
                </button>
                <span>{(design.widths[row] / 50).toFixed(1)}m</span>
                <button
                  aria-label={'Widen station ' + (row + 1)}
                  disabled={disabled || design.widths[row] >= 100}
                  onClick={() => {
                    const widths = design.widths.slice();
                    widths[row] = Math.min(100, widths[row] + 10);
                    onDesign({ widths });
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          ))}
          <p className="bow-label">STERN / REAR</p>
          <div className="blueprint-legend">
            <span>╳ Braced panel</span>
            <span>Numbered sections are drop targets</span>
          </div>
        </div>
        <div className="panel-inspector">
          <p className="eyebrow">SELECTED SECTION {selected + 1}</p>
          <h3>{panel ? materials[panel.material].name : 'Open hull gap'}</h3>
          <p>
            {panel
              ? panelWeight(design, selected).toFixed(1) +
                ' kg · ' +
                (panel.braced ? 'Braced' : 'Unbraced')
              : 'Fit a panel here before racing.'}
          </p>
          {design.engineSlot === selected && <p>Engine mounted here</p>}
          <button
            disabled={disabled || !panel}
            onClick={() => {
              const panels = design.panels.slice();
              panels[selected] = { ...panel!, braced: !panel!.braced };
              onDesign({ panels });
            }}
          >
            <Wrench size={16} />
            {panel?.braced ? 'Remove brace' : 'Add cross brace'}
          </button>
          <button
            disabled={disabled || !panel}
            onClick={() => {
              const panels = design.panels.slice();
              panels[selected] = null;
              onDesign({ panels });
              setMessage('Panel removed. Drag another panel into the gap.');
            }}
          >
            <Trash2 size={16} /> Remove panel
          </button>
          <p className="inspector-help">
            In Select / move mode, drag an installed panel onto another section
            to exchange them. Braces add 9 kg and support local loads.
          </p>
        </div>
      </div>
      <div className="depth-section">
        <p className="eyebrow">SIDE PROFILE / DRAG KEEL NODES</p>
        <svg
          className="depth-profile"
          viewBox="0 0 400 190"
          aria-label="Hull depth profile"
        >
          <line
            x1="30"
            x2="370"
            y1="30"
            y2="30"
            stroke="#668fa0"
            strokeDasharray="4 5"
          />
          <polyline
            points={
              '30,30 ' +
              design.depths
                .map((d, i) => 50 + i * 75 + ',' + (30 + d * 100))
                .join(' ') +
              ' 350,30'
            }
            fill="#205669"
            stroke="#70d7cb"
            strokeWidth="2"
          />
          {design.depths.map((d, i) => (
            <g key={i}>
              <circle
                cx={50 + i * 75}
                cy={30 + d * 100}
                r="9"
                fill="#f4b544"
                className="depth-node"
                tabIndex={disabled ? -1 : 0}
                role="slider"
                aria-label={'Station ' + (i + 1) + ' depth'}
                aria-valuemin={0.25}
                aria-valuemax={1.2}
                aria-valuenow={d}
                onPointerDown={(e) => shapeStart(e, i, 'depth')}
                {...shapeEvents}
                onKeyDown={(e) => {
                  if (disabled || !['ArrowUp', 'ArrowDown'].includes(e.key))
                    return;
                  e.preventDefault();
                  const depths = design.depths.slice();
                  depths[i] = Math.max(
                    0.25,
                    Math.min(
                      1.2,
                      Math.round(
                        (depths[i] + (e.key === 'ArrowDown' ? 0.05 : -0.05)) *
                          100,
                      ) / 100,
                    ),
                  );
                  onDesign({ depths });
                }}
              />
              <text
                x={50 + i * 75}
                y="178"
                textAnchor="middle"
                fill="#bdd6df"
                fontSize="12"
              >
                {d.toFixed(2)}m
              </text>
            </g>
          ))}
        </svg>
        <p>
          Pull a yellow corner to reshape joined panels. Port and starboard
          corners stay mirrored.
        </p>
      </div>
      <p className="builder-status" role="status">
        {message}
      </p>
      {ghost && (
        <div
          className="drag-ghost"
          style={{ left: ghost.x + 14, top: ghost.y - 20 }}
        >
          {ghost.tool.kind === 'panel'
            ? materials[ghost.tool.material].name + ' panel'
            : ghost.tool.kind === 'engine'
              ? 'Engine'
              : 'Move panel'}
        </div>
      )}
    </section>
  );
}
