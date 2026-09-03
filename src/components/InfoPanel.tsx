/*
 * InfoPanel.tsx — the learning side of the app (right column on
 * desktop, bottom sheet on mobile; App.tsx mounts it in both places).
 *
 * TWO MODES, switched by selectedId:
 *
 *   selectedId === null  →  INDEX
 *       The "System bodies" list — one row per body from BODIES with a
 *       color chip, its class, and its compact orbital period. This is
 *       the fallback view and the answer to "what can I click?".
 *
 *   selectedId === "…"   →  DOSSIER
 *       Header (back-to-index + name + class chip), then:
 *       · live telemetry  — orbits completed, recomputed from the same
 *                           simDays the map uses, so the counter and
 *                           the planet's position never disagree.
 *                           (For the Sun we count rotations instead —
 *                           25.4 d is its equatorial spin period.)
 *       · stat grid       — diameter, distance, period, day, moons,
 *                           temperature. All values from bodies.ts.
 *       · size bar        — visual size-vs-Earth comparison.
 *       · field note      — one curated fun fact per body.
 *
 * RENDERING TRICK: key={body.id} on the scroll container forces a
 * remount when you switch planets, which replays the .fade-slide entry
 * animation (defined in index.css). Remove the key and the slide dies.
 */

import {
  BODIES,
  EARTH_DIAMETER_KM,
  fmtInt,
  formatDistanceMkm,
  formatPeriod,
  shortPeriod,
} from "../data/bodies";

interface InfoPanelProps {
  selectedId: string | null;
  simDays: number;
  onSelect: (id: string | null) => void;
}

/**
 * Width of the "size vs Earth" bar, in %.
 * A linear scale is useless here — Mercury (0.38× Earth) and Jupiter
 * (11×) would both look like slivers next to each other. So the bar
 * runs on log10(ratio), mapped onto an 8–100% width window: it's honest
 * about ORDER (bigger = longer) while the "× Earth" figure beside it
 * carries the exact magnitude. Adjust lo/hi if you add a body more
 * extreme than 0.3×–110× Earth.
 */
function sizeBarPercent(diameterKm: number): number {
  const ratio = diameterKm / EARTH_DIAMETER_KM;
  const lo = Math.log10(0.3);
  const hi = Math.log10(110);
  const t = (Math.log10(ratio) - lo) / (hi - lo);
  return Math.min(100, Math.max(7, 8 + t * 92));
}

/** one cell of the stat grid — label / big value / optional context line */
function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
        {label}
      </div>
      <div className="font-display mt-1 text-[13px] font-bold leading-tight text-ink">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] leading-snug text-dim">{sub}</div>}
    </div>
  );
}

export default function InfoPanel({ selectedId, simDays, onSelect }: InfoPanelProps) {
  const body = BODIES.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="flex max-h-full min-h-0 flex-col">
      {body ? (
        /* ═══════════════════ MODE 1: DOSSIER ═══════════════════ */
        <div className="flex min-h-0 flex-col">
          {/* header: back-to-index button + "Dossier" eyebrow */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <button
              onClick={() => onSelect(null)}
              className="group flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-dim transition-colors hover:border-ember/50 hover:text-ember-soft"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
              Index
            </button>
            <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-faint">
              Dossier
            </span>
          </div>

          {/* key= remounts per body → replays .fade-slide (see header) */}
          <div key={body.id} className="panel-scroll fade-slide min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {/* name + class chip */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-[0_0_14px_2px]"
                    style={{ background: body.color, boxShadow: `0 0 14px 1px ${body.color}66` }}
                  />
                  <h2 className="font-display text-[26px] font-black uppercase leading-none tracking-[0.06em] text-ink">
                    {body.name}
                  </h2>
                </div>
                <div className="mt-2 inline-block rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-dim">
                  {body.kind}
                </div>
              </div>
            </div>

            {/* live telemetry — the "it's running" heartbeat of the panel */}
            <div className="mt-5 rounded-lg border border-ember/25 bg-ember/[0.05] px-4 py-3">
              {body.periodDays > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-ember-soft">
                      {(simDays / body.periodDays).toFixed(2)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-dim">
                      orbits completed
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-dim">
                    Now on orbit №{fmtInt(Math.floor(simDays / body.periodDays) + 1)} — day{" "}
                    {fmtInt(Math.floor(simDays % body.periodDays) + 1)} of{" "}
                    {fmtInt(body.periodDays)}
                  </div>
                </>
              ) : (
                /* Sun branch: it doesn't orbit, so we count its spin */
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-ember-soft">
                      {(simDays / 25.4).toFixed(1)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-dim">
                      rotations completed
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-dim">
                    The whole system revolves around this star
                  </div>
                </>
              )}
            </div>

            {/* stat grid — the four facts the brief asks for + extras */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Stat
                label="Diameter"
                value={`${fmtInt(body.diameterKm)} km`}
                sub={`${
                  body.diameterKm / EARTH_DIAMETER_KM >= 10
                    ? Math.round(body.diameterKm / EARTH_DIAMETER_KM)
                    : (body.diameterKm / EARTH_DIAMETER_KM).toFixed(2)
                }× Earth`}
              />
              <Stat
                label="Dist. from Sun"
                value={body.distanceMkm !== null ? formatDistanceMkm(body.distanceMkm) : "System center"}
                sub={body.distanceMkm !== null ? `${body.au} AU` : "0 AU by definition"}
              />
              <Stat
                label={body.periodDays > 0 ? "Orbital period" : "Rotation (equator)"}
                value={
                  body.periodDays > 0 ? formatPeriod(body.periodDays).main : "25.4 Earth days"
                }
                sub={body.periodDays > 0 ? formatPeriod(body.periodDays).sub : "spin of its equator"}
              />
              <Stat label="Day length" value={body.dayLength} />
              <Stat label="Moons" value={body.moons} />
              <Stat label="Temperature" value={body.tempC} />
            </div>

            {/* size comparison (log-scaled bar — see sizeBarPercent) */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                  Size vs Earth
                </span>
                <span className="font-display text-[11px] font-bold text-halo">
                  {body.diameterKm / EARTH_DIAMETER_KM >= 10
                    ? `${Math.round(body.diameterKm / EARTH_DIAMETER_KM)}×`
                    : `${(body.diameterKm / EARTH_DIAMETER_KM).toFixed(2)}×`}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${sizeBarPercent(body.diameterKm)}%`,
                    background: `linear-gradient(90deg, ${body.colorDark}, ${body.color})`,
                  }}
                />
              </div>
            </div>

            {/* field note — the one-liner that makes it stick */}
            <div className="mt-5 border-l-2 border-ember/70 bg-white/[0.03] py-3 pl-4 pr-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-soft/80">
                Field note
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink/90">{body.fact}</p>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════ MODE 2: INDEX ═══════════════════ */
        <div className="flex min-h-0 flex-col">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.28em] text-ink">
              System bodies
            </h2>
            <p className="mt-1 text-[12px] text-dim">
              Select a world to open its dossier — or click it in the map.
            </p>
          </div>
          <div className="panel-scroll min-h-0 flex-1 overflow-y-auto p-2.5">
            {BODIES.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelect(b.id)}
                className="group mb-1 flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full transition-transform group-hover:scale-125"
                  style={{ background: b.color, boxShadow: `0 0 10px ${b.color}55` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                    {b.name}
                  </span>
                  <span className="block text-[11px] text-faint">{b.kind}</span>
                </span>
                <span className="font-display text-[11px] font-bold text-dim">
                  {b.periodDays > 0 ? shortPeriod(b.periodDays) : "star"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
