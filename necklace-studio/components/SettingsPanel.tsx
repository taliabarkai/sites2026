'use client';
/**
 * Settings panel, generated from engine/settings.ts — every ShapeDiver model
 * parameter plus the studio's own physics/render knobs, grouped like the
 * ShapeDiver page. Parameters that the engine does not implement yet are shown
 * (so nothing on the model page is silently missing) but disabled.
 */
import { useState } from 'react';
import { PARAMS, type Param, type Settings } from '@/engine/settings.ts';

const WHERE_LABEL: Record<string, string> = { plate: 'server · geometry', render: 'server · render', necklace: 'live · physics', material: 'live · 3D' };
const SOURCE_LABEL: Record<string, string> = { model: 'ShapeDiver', gh: '.gh slider', studio: 'studio' };

function Control({ p, value, onChange }: { p: Param; value: Settings[string]; onChange: (v: Settings[string]) => void }) {
  const disabled = !!p.unsupported;
  if (p.type === 'bool') {
    return <input type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />;
  }
  if (p.type === 'choice') {
    return (
      <select value={String(value)} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {p.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }
  return (
    <div className="num">
      <input type="range" min={p.min} max={p.max} step={p.step} value={Number(value)} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
      <input type="number" min={p.min} max={p.max} step={p.step} value={Number(value)} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
      {p.unit && <span className="unit">{p.unit}</span>}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange }: { settings: Settings; onChange: (key: string, v: Settings[string]) => void }) {
  const groups = [...new Set(PARAMS.map((p) => p.group))];
  // Every section starts collapsed.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <div className="settings">
      {groups.map((g) => (
        <div key={g} className="sgroup">
          <button className="shead" onClick={() => setOpen((o) => ({ ...o, [g]: !o[g] }))} aria-expanded={!!open[g]}>
            <span>{g}</span>
            <span className="chev">{open[g] ? '−' : '+'}</span>
          </button>
          {open[g] &&
            PARAMS.filter((p) => p.group === g).map((p) => (
              <div key={p.key} className={`param${p.unsupported ? ' off' : ''}`} title={p.help ?? ''}>
                <div className="plabel">
                  <span>{p.label}</span>
                  <span className="tags">
                    {p.unsupported ? <span className="tag warn">not ported</span> : <span className="tag">{WHERE_LABEL[p.where]}</span>}
                    <span className="tag src">{SOURCE_LABEL[p.source]}</span>
                  </span>
                </div>
                <Control p={p} value={settings[p.key]} onChange={(v) => onChange(p.key, v)} />
                {p.help && <div className="phelp">{p.help}</div>}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
