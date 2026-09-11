'use client';
import { useState } from 'react';
import { parseSave, stats, type Save } from '@/lib/game';
export default function Garage({
  save,
  disabled,
  onChange,
}: {
  save: Save;
  disabled: boolean;
  onChange: (s: Save) => void;
}) {
  const [name, setName] = useState('My runabout');
  const [notice, setNotice] = useState('');
  const boats = save.garage || [];
  return (
    <section className="garage-panel">
      <h2>Your garage</h2>
      <p>
        Keep up to 12 named builds. Saving a build takes a snapshot; loading it
        keeps your credits, unlocks, and purchased engine tuning.
      </p>
      <fieldset disabled={disabled}>
        <label>
          Boat name
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          disabled={!name.trim() || boats.length >= 12}
          onClick={() => {
            onChange({
              ...save,
              garage: [
                ...boats,
                {
                  id: crypto.randomUUID(),
                  name: name.trim(),
                  design: structuredClone(save.design),
                },
              ],
            });
            setNotice('Design saved in your garage.');
          }}
        >
          Save new design
        </button>
        {boats.map((boat) => (
          <article key={boat.id}>
            <h3>{boat.name}</h3>
            <p>
              {boat.design.hull === 'v' ? 'Deep-V' : 'Flat-bottom'} ·{' '}
              {stats(boat.design).mass} kg · {stats(boat.design).knots} kn in
              harbor conditions
            </p>
            <button
              onClick={() => {
                try {
                  onChange(
                    parseSave(
                      JSON.stringify({
                        ...save,
                        design: {
                          ...boat.design,
                          engineMods: save.design.engineMods,
                        },
                      }),
                    ),
                  );
                  setNotice('Loaded ' + boat.name);
                } catch {
                  setNotice(
                    'This design needs parts that are not available in this save.',
                  );
                }
              }}
            >
              Load {boat.name}
            </button>
            <button
              disabled={!name.trim()}
              onClick={() => {
                onChange({
                  ...save,
                  garage: boats.map((v) =>
                    v.id === boat.id ? { ...v, name: name.trim() } : v,
                  ),
                });
                setNotice('Boat renamed.');
              }}
            >
              Rename {boat.name}
            </button>
            <button
              onClick={() => {
                onChange({
                  ...save,
                  garage: boats.map((v) =>
                    v.id === boat.id
                      ? { ...v, design: structuredClone(save.design) }
                      : v,
                  ),
                });
                setNotice('Updated ' + boat.name);
              }}
            >
              Replace with current build
            </button>
          </article>
        ))}
      </fieldset>
      <output>{notice}</output>
    </section>
  );
}
