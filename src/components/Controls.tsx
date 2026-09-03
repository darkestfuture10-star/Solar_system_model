/*
 * Controls.tsx — the mission-control footer.
 *
 * ANATOMY (left → right, wrapping on narrow screens):
 *   ZONE 1  transport   — big play/pause button (the visual anchor of
 *                         the app; it glows while running) + reset
 *   ZONE 2  sim speed   — segmented ×0.5…×10 buttons from SPEED_OPTIONS
 *   ZONE 3  layers      — Orbits / Labels toggle pills
 *   ZONE 4  clock       — DAY counter + Earth years + effective rate,
 *                         pinned right with ml-auto
 *
 * All state lives in App.tsx — this component is deliberately dumb:
 * it renders props and calls callbacks. Keep it that way and it stays
 * trivially testable.
 */

import { BASE_DAYS_PER_SECOND, SPEED_OPTIONS, fmtInt } from "../data/bodies";

interface ControlsProps {
  playing: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  onReset: () => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  simDays: number;
}

/** little on/off pill with a glowing dot — used for Orbits + Labels */
function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all ${
        active
          ? "border-halo/40 bg-halo/10 text-halo"
          : "border-white/10 text-faint hover:border-white/20 hover:text-dim"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors ${
          active ? "bg-ember shadow-[0_0_8px_rgba(255,200,77,0.9)]" : "bg-white/20"
        }`}
      />
      {label}
    </button>
  );
}

export default function Controls({
  playing,
  onTogglePlay,
  speed,
  onSpeedChange,
  onReset,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  simDays,
}: ControlsProps) {
  const years = simDays / 365.25;

  return (
    <footer className="relative z-30 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.07] bg-abyss/95 px-4 py-3 sm:px-6">
      {/* ── ZONE 1: transport ── */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "Pause simulation" : "Play simulation"}
          title={playing ? "Pause (Space)" : "Play (Space)"}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all active:scale-90 ${
            playing
              ? "border-ember/60 bg-ember/15 text-ember shadow-[0_0_22px_rgba(255,200,77,0.25)] hover:bg-ember/25"
              : "border-ember bg-ember text-[#231303] shadow-[0_0_22px_rgba(255,200,77,0.4)] hover:bg-ember-soft"
          }`}
        >
          {/* inline icons so the build has zero icon dependencies */}
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
              <path d="M7 4.5h3.6v15H7zM13.4 4.5H17v15h-3.6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4.5 w-4.5" fill="currentColor">
              <path d="M7.5 4.6v14.8a1 1 0 0 0 1.52.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4a1 1 0 0 0-1.52.86Z" />
            </svg>
          )}
        </button>
        <button
          onClick={onReset}
          aria-label="Reset simulation time"
          title="Reset time"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-dim transition-all hover:border-halo/40 hover:text-halo active:scale-90"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4v6h6" />
            <path d="M3.5 13a8.5 8.5 0 1 0 1.8-8.3L3 7" />
          </svg>
        </button>
      </div>

      <div className="hidden h-8 w-px bg-white/10 sm:block" />

      {/* ── ZONE 2: speed — segmented control, active = filled ── */}
      <div>
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-faint">
          Sim speed
        </div>
        <div className="flex overflow-hidden rounded-lg border border-white/10">
          {SPEED_OPTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`font-display px-2.5 py-1.5 text-[11px] font-bold transition-colors sm:px-3 ${
                i > 0 ? "border-l border-white/10" : ""
              } ${
                speed === s
                  ? "bg-ember text-[#231303]"
                  : "bg-white/[0.02] text-dim hover:bg-white/[0.07] hover:text-ink"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="hidden h-8 w-px bg-white/10 md:block" />

      {/* ── ZONE 3: layer toggles ── */}
      <div className="flex items-center gap-2">
        <TogglePill active={showOrbits} label="Orbits" onClick={onToggleOrbits} />
        <TogglePill active={showLabels} label="Labels" onClick={onToggleLabels} />
      </div>

      {/* ── ZONE 4: mission clock — proves the sim is alive even when
             the eye is on the footer ── */}
      <div className="ml-auto text-right">
        <div className="font-display text-sm font-bold tracking-[0.08em] text-ember-soft">
          DAY {fmtInt(simDays)}
        </div>
        <div className="text-[11px] text-faint">
          {years.toFixed(2)} Earth years ·{" "}
          {playing ? `${fmtInt(BASE_DAYS_PER_SECOND * speed)} d/s` : "paused"}
        </div>
      </div>
    </footer>
  );
}
