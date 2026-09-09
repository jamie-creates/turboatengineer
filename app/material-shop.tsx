'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  materials,
  ownedFor,
  unlockReputation,
  materialCost,
  type Save,
  type MaterialRole,
} from '@/lib/game';
export default function MaterialShop({
  save,
  onChange,
  disabled,
}: {
  save: Save;
  onChange: (fn: (s: Save) => Save) => void;
  disabled: boolean;
}) {
  function buy(role: MaterialRole, i: number) {
    if (disabled) return;
    onChange((s) => {
      const owned = ownedFor(s, role),
        cost = materialCost(i, role);
      if (
        s.xp < unlockReputation(i, role) ||
        (!owned.includes(i) && s.credits < cost)
      )
        return s;
      const ownedKey =
          role === 'hull'
            ? 'ownedMaterials'
            : role === 'seats'
              ? 'ownedSeatMaterials'
              : 'ownedSternMaterials',
        designKey =
          role === 'hull'
            ? 'material'
            : role === 'seats'
              ? 'seatMaterial'
              : 'sternMaterial';
      return {
        ...s,
        credits: s.credits - (owned.includes(i) ? 0 : cost),
        [ownedKey]: owned.includes(i) ? owned : [...owned, i],
        design: { ...s.design, [designKey]: i },
      };
    });
  }
  return (
    <Tabs defaultValue="hull" className="material-tabs">
      <TabsList aria-label="Component material shop">
        {(['hull', 'seats', 'stern'] as const).map((role) => (
          <TabsTrigger key={role} value={role}>
            {role === 'hull' ? 'Hull' : role === 'seats' ? 'Seats' : 'Transom'}
          </TabsTrigger>
        ))}
      </TabsList>
      {(['hull', 'seats', 'stern'] as const).map((role) => (
        <TabsContent key={role} value={role}>
          <p className="material-role-note">
            {role === 'hull'
              ? 'Hull supplies add individual panels to the engineering bench.'
              : role === 'seats'
                ? 'Seat shells unlock at 20% of hull reputation and cost 25% as much. Cushions are included.'
                : 'The transom closes the stern. Structural materials unlock at 75% of hull reputation and cost half as much.'}
          </p>
          <div className="material-list">
            {materials.map((m, i) => {
              const owned = ownedFor(save, role).includes(i),
                rep = unlockReputation(i, role),
                cost = materialCost(i, role),
                locked = save.xp < rep,
                selected =
                  role === 'hull'
                    ? save.design.material === i
                    : role === 'seats'
                      ? save.design.seatMaterial === i
                      : save.design.sternMaterial === i;
              return (
                <button
                  key={m.name}
                  disabled={
                    disabled || locked || (!owned && save.credits < cost)
                  }
                  aria-pressed={selected}
                  className={selected ? 'selected' : ''}
                  onClick={() => buy(role, i)}
                >
                  <span
                    className="material-chip"
                    style={{ background: m.color }}
                  />
                  <span>
                    {m.name}
                    <small>{m.tag}</small>
                  </span>
                  <span className="cost">
                    {locked
                      ? rep + ' rep'
                      : owned
                        ? role === 'hull'
                          ? 'In tray'
                          : selected
                            ? 'Fitted'
                            : 'Owned'
                        : cost + ' cr'}
                  </span>
                </button>
              );
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
