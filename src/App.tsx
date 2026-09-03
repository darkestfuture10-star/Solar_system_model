/*
 * App.tsx — the conductor. Owns ALL state and lays out the screen.
 *
 * STATE MAP (everything the UI reacts to lives here):
 *   simDays     — the simulation clock in Earth days. THE master
 *                 number: Orrery positions, InfoPanel telemetry and
 *                 the footer clock all derive from it.
 *   playing     — whether the clock advances
 *   speed       — multiplier from SPEED_OPTIONS (data/bodies.ts)
 *   selectedId  — whose dossier is open; null → panel shows the index
 *   hoveredId   — orbit highlight + always-on label for the hovered body
 *   showOrbits / showLabels — the two footer layer toggles
 *
 * LAYOUT (top → bottom):
 *   header    — wordmark + keyboard hints
 *   stage     — Starfield (backdrop) + Orrery (simulation), side by
 *               side with the InfoPanel column on desktop
 *   quick-pick strip — horizontal body chips, mobile only
 *   Controls  — play/pause · speed · toggles · mission clock
 *
 * On mobile the InfoPanel appears as a bottom sheet inside the stage,
 * and the quick-pick strip gives thumb-friendly access to every body.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BODIES, SPEED_OPTIONS, BASE_DAYS_PER_SECOND } from "./data/bodies";
import Starfield from "./components/Starfield";
import Orrery from "./components/Orrery";
import InfoPanel from "./components/InfoPanel";
import Controls from "./components/Controls";

export default function App() {
  const [simDays, setSimDays] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  /* Earth starts selected so the panel opens with a real dossier
     instead of the index — set to null if you prefer the empty state. */
  const [selectedId, setSelectedId] = useState<string | null>("earth");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  /* WHY REFS? The rAF loop below mounts ONCE and runs forever. Reading
     playing/speed through refs means toggling them doesn't tear the
     loop down (which would reset `last` and cause a visible time
     jump). Refs are synced in the two tiny effects below. */
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /* ── THE SIMULATION CLOCK ──
     Each frame: simDays += realSeconds × BASE_DAYS_PER_SECOND × speed.
     dt is clamped to 0.1s so returning from a background tab doesn't
     fast-forward the solar system by minutes. Everything visual is a
     pure function of simDays, so pausing freezes the sky perfectly. */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (playingRef.current) {
        const step = dt * BASE_DAYS_PER_SECOND * speedRef.current;
        setSimDays((d) => d + step);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* stable callbacks — Orrery re-renders 60×/s, don't churn its props */
  const select = useCallback((id: string | null) => setSelectedId(id), []);
  const hover = useCallback((id: string | null) => setHoveredId(id), []);

  /* ── KEYBOARD SHORTCUTS ──
     Space = play/pause (skipped when a button has focus, so Space on a
     focused button still clicks it), Esc = close dossier, +/− = speed.
     The header displays these hints on desktop. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (e.key === "+" || e.key === "=") {
        setSpeed((s) => SPEED_OPTIONS[Math.min(SPEED_OPTIONS.length - 1, SPEED_OPTIONS.indexOf(s) + 1)]);
      } else if (e.key === "-" || e.key === "_") {
        setSpeed((s) => SPEED_OPTIONS[Math.max(0, SPEED_OPTIONS.indexOf(s) - 1)]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasSelection = selectedId !== null;

  return (
    <div className="font-body flex h-dvh select-none flex-col overflow-hidden bg-void text-ink">
      {/* ─────────── TOP BAR ─────────── */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/[0.07] bg-abyss/95 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          {/* hand-drawn orrery mark — three orbits around a star */}
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ember" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
            <ellipse cx="12" cy="12" rx="9.5" ry="4.2" opacity="0.75" />
            <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(60 12 12)" opacity="0.5" />
            <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(120 12 12)" opacity="0.3" />
          </svg>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-[15px] font-black uppercase tracking-[0.3em] text-ink">
              The Orrery
            </h1>
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-faint sm:inline">
              Interactive solar system
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-3 text-[11px] text-faint md:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="kbd">SPACE</kbd> play / pause
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="kbd">+/−</kbd> speed
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="kbd">ESC</kbd> close
          </span>
        </div>
      </header>

      {/* ─────────── STAGE + DOSSIER ─────────── */}
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <Starfield />
          <Orrery
            simDays={simDays}
            selectedId={selectedId}
            hoveredId={hoveredId}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onSelect={select}
            onHover={hover}
          />

          {/* honesty badge — sizes/distances are compressed, say so */}
          <div className="pointer-events-none absolute bottom-3 left-4 z-20 text-[10px] uppercase tracking-[0.2em] text-faint/80">
            Sizes &amp; distances compressed for clarity — not to scale
          </div>

          {/* mobile dossier: same component, mounted as a bottom sheet */}
          {hasSelection && (
            <div className="rise-in absolute inset-x-3 bottom-3 z-20 flex max-h-[54%] flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/95 shadow-2xl shadow-black/70 backdrop-blur-md md:hidden">
              <InfoPanel selectedId={selectedId} simDays={simDays} onSelect={select} />
            </div>
          )}
        </main>

        {/* desktop dossier: fixed right column */}
        <aside className="hidden min-h-0 w-[340px] shrink-0 flex-col border-l border-white/[0.07] bg-abyss/80 md:flex lg:w-[380px]">
          <InfoPanel selectedId={selectedId} simDays={simDays} onSelect={select} />
        </aside>
      </div>

      {/* ─────────── QUICK-PICK STRIP (mobile only) ───────────
         Tiny planets are hard to tap; this strip guarantees access
         to every body regardless of zoom level or finger size. */}
      <div className="panel-scroll relative z-30 flex gap-2 overflow-x-auto border-t border-white/[0.07] bg-abyss/95 px-3 py-2 md:hidden">
        {BODIES.map((b) => (
          <button
            key={b.id}
            onClick={() => select(b.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              selectedId === b.id
                ? "border-ember/60 bg-ember/10 text-ember-soft"
                : "border-white/10 text-dim hover:border-white/25 hover:text-ink"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
            {b.name}
          </button>
        ))}
      </div>

      {/* ─────────── MISSION CONTROLS ─────────── */}
      <Controls
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        onReset={() => setSimDays(0)}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        simDays={simDays}
      />
    </div>
  );
}
