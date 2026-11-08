'use client';
/**
 * The demo page: up to five names → a draggable necklace, drawn either from
 * server sprites (2D canvas) or server GLBs (three.js), with every model
 * parameter exposed and savable as a named profile.
 *
 * What re-runs when a setting changes is decided by the setting's `where`:
 *   plate / render  → refetch plates from the server (new cache key)
 *   necklace        → rebuild the Matter.js world from the same plates
 *   material        → applied to the live 3D scene, nothing rebuilt
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Necklace, type NecklaceOptions } from './necklace/physics.ts';
import { loadLinks, loadPlate, type LoadedLinks, type LoadedPlate } from './necklace/assets.ts';
import { drawSpriteScene, plateHit, type View } from './necklace/drawSprite.ts';
import type { ThreeNecklace } from './necklace/three.ts';
import SettingsPanel from './SettingsPanel.tsx';
import { PARAMS, defaults, serverSubset, type Settings } from '@/engine/settings.ts';

type Mode = 'sprite' | '3d';
type Store = { active: string; profiles: Record<string, Settings> };
const BUILTIN = 'ShapeDiver live defaults';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [JSON.stringify(value), ms]);
  return v;
}

const keysWhere = (w: string[]) => PARAMS.filter((p) => w.includes(p.where)).map((p) => p.key);
const NECKLACE_KEYS = keysWhere(['necklace']);
const MATERIAL_KEYS = keysWhere(['material']);

function necklaceOptions(s: Settings, plates: LoadedPlate[]): NecklaceOptions {
  const n = (k: string) => Number(s[k]);
  return {
    plates: plates.map((p) => p.spec),
    spacingMode: s.spacingMode === 'gap' ? 'gap' : 'model',
    gapMm: n('gapMm'),
    spaceBetweenNames: n('spaceBetweenNames'),
    chainLengthMm: n('chainLengthMm'),
    necklaceDepthMm: n('necklaceDepthMm'),
    linkPitchMm: n('linkPitchMm'),
    gravity: Boolean(s.gravity),
    gravityScale: n('gravityScale'),
    solverIterations: n('solverIterations'),
    plateMassInLinks: n('plateMassInLinks'),
    frictionAir: n('frictionAir'),
    jointStiffness: n('jointStiffness'),
    jointDamping: n('jointDamping'),
    dragStiffness: n('dragStiffness'),
    dragDamping: n('dragDamping'),
    dragSpeedMm: n('dragSpeedMm'),
    maxJointGapMm: n('maxJointGapMm'),
    plateCollisions: Boolean(s.plateCollisions),
  };
}

export default function Studio() {
  const [names, setNames] = useState(['Yossi', 'Anna', 'Jo']);
  const [settings, setSettings] = useState<Settings>(defaults());
  const [store, setStore] = useState<Store | null>(null);
  const [profile, setProfile] = useState(BUILTIN);
  const [saveAs, setSaveAs] = useState('');
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<Mode>('sprite');
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [taut, setTaut] = useState(false);
  /** Multiplier on the auto-fit framing. 1 = Fit; the wheel and ± buttons change it. */
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  /** Names set aside by switching to Single, restored when switching back to Multi. */
  const stash = useRef<string[]>([]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvas2d = useRef<HTMLCanvasElement>(null);
  const canvas3d = useRef<HTMLCanvasElement>(null);
  const state = useRef<{ nk: Necklace; plates: LoadedPlate[]; links: LoadedLinks; view: View } | null>(null);
  const three = useRef<ThreeNecklace | null>(null);
  const live = useRef({ mode, dark, settings });
  live.current = { mode, dark, settings };

  // ---- profiles
  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((st: Store) => {
      setStore(st);
      setProfile(st.active);
      setSettings({ ...defaults(), ...st.profiles[st.active] });
    });
  }, []);
  const change = (key: string, v: Settings[string]) => {
    setSettings((s) => ({ ...s, [key]: v }));
    setDirty(true);
  };
  async function saveProfile(name: string) {
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, settings }) });
    const st = await res.json();
    if (!res.ok) return setError(st.error);
    setStore(st);
    setProfile(name);
    setSaveAs('');
    setDirty(false);
  }
  async function loadProfile(name: string, from: Store | null = store) {
    if (!from) return;
    setProfile(name);
    setSettings({ ...defaults(), ...from.profiles[name] });
    setDirty(false);
    const st = await (await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: name }) })).json();
    setStore(st);
  }
  async function deleteProfile(name: string) {
    const st: Store = await (await fetch(`/api/settings?name=${encodeURIComponent(name)}`, { method: 'DELETE' })).json();
    setStore(st);
    loadProfile(st.active, st);
  }

  // ---- derived inputs, debounced so dragging a slider doesn't hammer the server
  // The inscription list IS the product choice: one field = single nameplate,
  // 2–5 fields = multi-name. Removing down to one switches to single; adding a
  // second switches back. `productType` follows so saved profiles record it.
  const single = names.length === 1;
  const maxNames = 5;
  const cleanNames = useMemo(() => names.map((n) => n.trim()).filter(Boolean).slice(0, maxNames), [names.join('|')]);
  useEffect(() => {
    const want = single ? 'single' : 'multi';
    if (settings.productType !== want) setSettings((st) => ({ ...st, productType: want }));
  }, [single]);
  /** The Product setting (panel, toggle or a loaded profile) reshapes the list. */
  const setProduct = (type: 'single' | 'multi', byUser = true) => {
    // Computed outside the state updater: React runs updaters twice in dev,
    // and a side effect in one (consuming the stash) loses names.
    if (type === 'single') {
      const keep = names.find((n) => n.trim()) ?? names[0] ?? '';
      if (names.length > 1) stash.current = names.filter((n) => n !== keep);
      setNames([keep]);
    } else if (names.length < 2) {
      const back = stash.current.length ? stash.current : [''];
      stash.current = [];
      setNames([...names, ...back].slice(0, 5));
    }
    if (!byUser) return; // a loaded profile already carries productType
    setSettings((st) => ({ ...st, productType: type }));
    setDirty(true);
  };
  useEffect(() => {
    // A profile or the panel set productType: follow it.
    if (settings.productType === 'single' && names.length !== 1) setProduct('single', false);
    if (settings.productType === 'multi' && names.length < 2) setProduct('multi', false);
  }, [settings.productType]);
  const serverKey = JSON.stringify(serverSubset(settings));
  const necklaceKey = JSON.stringify(NECKLACE_KEYS.map((k) => settings[k]));
  const debounced = useDebounced({ names: cleanNames.join('|'), serverKey, necklaceKey }, 300);
  const plateCache = useRef<{ key: string; plates: LoadedPlate[]; links: LoadedLinks } | null>(null);

  // ---- load plates (server) + build the Matter.js world (client)
  useEffect(() => {
    const list = debounced.names ? debounced.names.split('|') : [];
    if (!list.length) return;
    const ac = new AbortController();
    (async () => {
      try {
        setError('');
        const t0 = performance.now();
        const server = JSON.parse(debounced.serverKey);
        const assetKey = debounced.names + debounced.serverKey;
        let cached = plateCache.current?.key === assetKey ? plateCache.current : null;
        if (!cached) {
          const [plates, links] = await Promise.all([Promise.all(list.map((n) => loadPlate(n, server, ac.signal))), loadLinks(String(server.coating))]);
          cached = { key: assetKey, plates, links };
        }
        if (ac.signal.aborted) return;
        plateCache.current = cached;
        const { plates, links } = cached;
        const nk = new Necklace(necklaceOptions(live.current.settings, plates));
        nk.settle();
        state.current = { nk, plates, links, view: { scale: 1, ox: 0, oy: 0, dpr: 1 } };
        if (process.env.NODE_ENV !== 'production') (window as any).__studio = state;
        layout();
        if (three.current) {
          await three.current.load(plates, links, nk.n + 16);
          applyMaterial();
          layout();
        }
        const fresh = plates.filter((p) => p.cache === 'MISS');
        const notes = [...new Set(plates.flatMap((p) => p.meta.unsupported))];
        setStatus(
          `${plates.length} plate${plates.length > 1 ? 's' : ''} · ${(performance.now() - t0).toFixed(0)} ms · ` +
            (fresh.length ? `${fresh.length} generated on the server (${fresh.map((p) => p.solveMs.toFixed(0) + ' ms').join(', ')})` : 'plates from cache') +
            ` · ${nk.links.length} links · joint gap ${nk.maxJointGapMm().toFixed(2)} mm` +
            (notes.length ? ` · not drawn yet: ${notes.join('; ')}` : ''),
        );
      } catch (e: any) {
        if (!ac.signal.aborted) setError(String(e.message ?? e));
      }
    })();
    return () => ac.abort();
  }, [debounced.names, debounced.serverKey, debounced.necklaceKey]);

  function applyMaterial() {
    const s = live.current.settings;
    three.current?.setMaterial({
      metalMetallic: Number(s.metalMetallic),
      metalRoughness: Number(s.metalRoughness),
      envIntensity: Number(s.envIntensity),
      viewTilt: Number(s.viewTilt),
      enable3dChain: Boolean(s.enable3dChain),
    });
  }
  useEffect(applyMaterial, [JSON.stringify(MATERIAL_KEYS.map((k) => settings[k])), settings.enable3dChain]);

  // ---- three.js, created the first time 3D is opened
  useEffect(() => {
    if (mode !== '3d' || three.current || !canvas3d.current) return;
    let cancelled = false;
    import('./necklace/three.ts').then(async ({ ThreeNecklace }) => {
      if (cancelled || !canvas3d.current) return;
      three.current = new ThreeNecklace(canvas3d.current);
      if (process.env.NODE_ENV !== 'production') (window as any).__three = three.current;
      const s = state.current;
      if (s) await three.current.load(s.plates, s.links, s.nk.n + 16);
      applyMaterial();
      layout();
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  function layout() {
    const s = state.current, wrap = wrapRef.current;
    if (!s || !wrap) return;
    const w = wrap.clientWidth, h = wrap.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    // Product-shot framing on the names; the chain runs out of frame toward the clasp.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pl of s.nk.plates) for (const i of pl.p) {
      minX = Math.min(minX, s.nk.x[i]); maxX = Math.max(maxX, s.nk.x[i]);
      minY = Math.min(minY, s.nk.y[i]); maxY = Math.max(maxY, s.nk.y[i]);
    }
    const spanX = maxX - minX + 40, spanY = maxY - minY + 30;
    // A lone nameplate filling 90% of the stage is too close: Fit frames it at ~45%.
    const fill = s.nk.plates.length === 1 ? 0.45 : 0.9;
    const scale = Math.min((w * fill) / spanX, (h * fill * 0.6) / spanY) * zoomRef.current;
    s.view = { scale, ox: w / 2 - ((minX + maxX) / 2) * scale, oy: h * 0.58 - ((minY + maxY) / 2) * scale, dpr };
    for (const c of [canvas2d.current, canvas3d.current]) {
      if (!c) continue;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    }
    if (canvas2d.current) {
      canvas2d.current.width = Math.round(w * dpr);
      canvas2d.current.height = Math.round(h * dpr);
    }
    three.current?.resize(w, h, dpr, s.view);
  }

  // ---- animation loop + resize
  useEffect(() => {
    let raf = 0;
    let tautTimer: ReturnType<typeof setTimeout> | undefined;
    let reported = false;
    const loop = (t: number) => {
      // Schedule first: an error in one frame must never stop the animation.
      raf = requestAnimationFrame(loop);
      const s = state.current;
      if (s) try {
        s.nk.step();
        if (s.nk.released) {
          s.nk.released = false;
          setTaut(true);
          clearTimeout(tautTimer);
          tautTimer = setTimeout(() => setTaut(false), 1400);
        }
        const { mode: m, dark: d, settings: st } = live.current;
        if (m === 'sprite' && canvas2d.current) {
          drawSpriteScene(canvas2d.current.getContext('2d')!, s.view, s.nk, s.plates, s.links, t, d, Boolean(st.enable3dChain));
        } else if (three.current?.ready && three.current.plates.length === s.plates.length) {
          three.current.apply(s.nk);
          three.current.render(d);
        }
      } catch (err) {
        if (!reported) console.error('[studio] frame failed, animation continues:', err);
        reported = true;
      }
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => layout());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tautTimer);
      ro.disconnect();
      three.current?.dispose();
      three.current = null;
    };
  }, []);

  // ---- dragging: canvas px → world mm → the physics' soft, guarded drag
  function toWorld(e: React.PointerEvent) {
    const s = state.current!;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    return { cx, cy, x: (cx - s.view.ox) / s.view.scale, y: (cy - s.view.oy) / s.view.scale };
  }
  function onDown(e: React.PointerEvent) {
    const s = state.current;
    if (!s) return;
    const p = toWorld(e);
    const i = s.nk.pick(p.x, p.y, 4, (k) => plateHit(s.view, s.nk, s.plates[k], k, p.cx, p.cy));
    if (i === null) return;
    s.nk.startDrag(i, p.x, p.y);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Capture only keeps the drag when the pointer leaves the stage; never let it cancel the drag.
    }
  }
  function onMove(e: React.PointerEvent) {
    const s = state.current;
    if (!s?.nk.dragging) return;
    const p = toWorld(e);
    s.nk.moveDrag(p.x, p.y);
  }
  function onUp() {
    state.current?.nk.endDrag();
  }

  useEffect(() => layout(), [zoom]);
  const zoomBy = (f: number) => setZoom((z) => Math.min(4, Math.max(0.25, z * f)));
  // Wheel zoom on the stage (non-passive so the page doesn't scroll instead).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(Math.exp(-e.deltaY * 0.0015));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const setName = (i: number, v: string) => setNames((ns) => ns.map((n, k) => (k === i ? v : n)));
  const profileNames = store ? Object.keys(store.profiles) : [BUILTIN];

  return (
    <main className="studio">
      <section className="panel">
        <h1>Name necklace</h1>
        <p className="sub">Geometry, sprites and 3D generated on our Next.js server from Oleg's TG-CARRIE definition. No ShapeDiver, no Rhino.</p>

        <label className="group">Product</label>
        <div className="seg">
          <button className={single ? 'on' : ''} onClick={() => setProduct('single')}>Single nameplate</button>
          <button className={!single ? 'on' : ''} onClick={() => setProduct('multi')}>Multi-name (2–5)</button>
        </div>

        <label className="group">Inscriptions</label>
        {names.map((n, i) => (
          <div className="row" key={i}>
            <input value={n} maxLength={9} placeholder={`Inscription ${i + 1}`} onChange={(e) => setName(i, e.target.value)} />
            {names.length > 1 && (
              <button className="ghost" onClick={() => setNames((ns) => ns.filter((_, k) => k !== i))} aria-label={`Remove inscription ${i + 1}`}>
                ×
              </button>
            )}
          </div>
        ))}
        {!single && cleanNames.length < 2 && <p className="note">Type a second name, or remove the empty field for a single nameplate.</p>}
        {names.length < maxNames && (
          <button className="ghost add" onClick={() => setNames((ns) => [...ns, ''])}>
            + Add inscription
          </button>
        )}

        <label className="group">Preview</label>
        <div className="seg">
          <button className={mode === 'sprite' ? 'on' : ''} onClick={() => setMode('sprite')}>Sprite</button>
          <button className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}>3D</button>
          <button className={dark ? 'on' : ''} onClick={() => setDark((d) => !d)}>Dark</button>
        </div>

        <label className="group">Settings profile</label>
        <div className="row">
          <select value={profile} onChange={(e) => loadProfile(e.target.value)}>
            {profileNames.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          {profile !== BUILTIN && (
            <button className="ghost" onClick={() => deleteProfile(profile)} aria-label="Delete profile" title="Delete this profile">
              ×
            </button>
          )}
        </div>
        <div className="row">
          {profile !== BUILTIN && (
            <button className={dirty ? 'primary' : ''} disabled={!dirty} onClick={() => saveProfile(profile)}>
              {dirty ? 'Save changes' : 'Saved'}
            </button>
          )}
          <button className="ghost" onClick={() => { setSettings(defaults()); setDirty(true); }}>Reset to defaults</button>
        </div>
        <div className="row">
          <input value={saveAs} placeholder="New profile name" maxLength={60} onChange={(e) => setSaveAs(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveAs.trim() && saveProfile(saveAs.trim())} />
          <button disabled={!saveAs.trim()} onClick={() => saveProfile(saveAs.trim())}>Save as</button>
        </div>
        {dirty && <p className="note">Unsaved changes{profile === BUILTIN ? ' — the built-in profile is read-only, use Save as' : ''}.</p>}

        <SettingsPanel settings={settings} onChange={change} />
        {error && <p className="error">{error}</p>}
        <p className="status">{status}</p>
      </section>
      <section className="stage" ref={wrapRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <canvas ref={canvas2d} style={{ display: mode === 'sprite' ? 'block' : 'none' }} />
        <canvas ref={canvas3d} style={{ display: mode === '3d' ? 'block' : 'none' }} />
        <div className="zoom" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
          <button onClick={() => setZoom(1)} aria-label="Fit">{zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`}</button>
          <button onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        </div>
        <p className={`hint${taut ? ' taut' : ''}`}>{taut ? 'The chain is taut, so it slipped out of your fingers' : 'Drag a name or the chain'}</p>
      </section>
    </main>
  );
}
