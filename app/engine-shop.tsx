'use client';
import { Wrench } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  engines,
  upgrades,
  engineSpec,
  purchaseUpgrade,
  type Save,
} from '@/lib/game';
export default function EngineShop({
  save,
  onChange,
  disabled,
}: {
  save: Save;
  onChange: (fn: (s: Save) => Save) => void;
  disabled: boolean;
}) {
  const spec = engineSpec(save.design);
  function fit(i: number) {
    if (disabled) return;
    onChange((s) => {
      const owned = s.ownedEngines.includes(i),
        cost = engines[i].cost;
      if (!owned && s.credits < cost) return s;
      return {
        ...s,
        credits: s.credits - (owned ? 0 : cost),
        ownedEngines: owned ? s.ownedEngines : [...s.ownedEngines, i],
        design: { ...s.design, engine: i },
      };
    });
  }
  return (
    <>
      <div className="engine-summary">
        <strong>{spec.name}</strong>
        <span>
          {spec.hp} HP · {spec.mass.toFixed(1)} kg
        </span>
      </div>
      <Dialog>
        <DialogTrigger className="shop-button" disabled={disabled}>
          <Wrench size={17} /> Open engine shop
        </DialogTrigger>
        <DialogContent className="engine-dialog">
          <DialogHeader>
            <DialogTitle>Engine shop</DialogTitle>
            <DialogDescription>
              Build your powerplant. Upgrades stay with each engine when you
              swap it out.
            </DialogDescription>
          </DialogHeader>
          <div className="engine-shop-balance">
            {save.credits} credits · {save.xp} reputation
          </div>
          <div className="engine-list">
            {engines.map((e, i) => (
              <button
                key={e.name}
                aria-pressed={save.design.engine === i}
                className={save.design.engine === i ? 'selected' : ''}
                disabled={
                  disabled ||
                  (!save.ownedEngines.includes(i) && save.credits < e.cost)
                }
                onClick={() => fit(i)}
              >
                <span>
                  {e.name}
                  <small>{e.hp} HP stock</small>
                </span>
                <b>
                  {save.design.engine === i
                    ? 'Fitted'
                    : save.ownedEngines.includes(i)
                      ? 'Fit engine'
                      : e.cost + ' cr'}
                </b>
              </button>
            ))}
          </div>
          <div className="engine-shop-stats">
            <strong>{spec.hp} HP</strong>
            <span>{spec.mass.toFixed(1)} kg</span>
            <span>{spec.reliability}/100 reliability</span>
          </div>
          <div className="upgrade-list">
            {upgrades.map((u, i) => {
              const fitted =
                  save.design.engineMods[save.design.engine].includes(i),
                locked = save.xp < u.xp;
              return (
                <div key={u.name}>
                  <div>
                    <h3>{u.name}</h3>
                    <p>{u.description}</p>
                    <small>
                      +{Math.round(u.gain * 1000) / 10}% stock power ·{' '}
                      {u.reliability >= 0 ? '+' : ''}
                      {u.reliability} reliability
                    </small>
                  </div>
                  <button
                    disabled={
                      disabled || fitted || locked || save.credits < u.cost
                    }
                    onClick={() => onChange((s) => purchaseUpgrade(s, i))}
                  >
                    {fitted
                      ? 'Fitted'
                      : locked
                        ? u.xp + ' rep'
                        : u.cost + ' cr'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="weight-note">
            Tuning gains are provisional game estimates. Engine reliability
            contributes to your boat&apos;s strength score.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
