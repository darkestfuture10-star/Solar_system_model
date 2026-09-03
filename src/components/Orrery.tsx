import { useMemo } from "react";
import {
  BODIES,
  PLANETS,
  TAU,
  orbitRadiusOf,
  type CelestialBody,
} from "../data/bodies";

interface OrreryProps {
  simDays: number;
  selectedId: string | null;
  hoveredId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

const C = 500;

interface Pebble {
  a: number;
  rad: number;
  r: number;
  o: number;
}

export default function Orrery({
  simDays,
  selectedId,
  hoveredId,
  showOrbits,
  showLabels,
  onSelect,
  onHover,
}: OrreryProps) {
  const sun = BODIES[0];
  const sunSelected = selectedId === "sun";
  const sunHovered = hoveredId === "sun";

  const belt = useMemo<Pebble[]>(() => {
    const arr: Pebble[] = [];
    for (let i = 0; i < 130; i++) {
      arr.push({
        a: Math.random() * TAU,
        rad: 163 + Math.random() * 34,
        r: 0.6 + Math.random() * 0.9,
        o: 0.12 + Math.random() * 0.3,
      });
    }
    return arr;
  }, []);

  const selectedPlanet = PLANETS.find((p) => p.id === selectedId) ?? null;
  let selectedPos: { x: number; y: number } | null = null;
  if (selectedPlanet) {
    const th = selectedPlanet.angle0 + (simDays / selectedPlanet.periodDays) * TAU;
    const R = orbitRadiusOf(selectedPlanet.au);
    selectedPos = { x: C + R * Math.cos(th), y: C - R * Math.sin(th) };
  }

  const labelVisible = (b: CelestialBody) =>
    showLabels || hoveredId === b.id || selectedId === b.id;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of the solar system. Click any planet or the Sun to inspect it."
    >
      <defs>
        {BODIES.map((b) => (
          <radialGradient key={b.id} id={`g-${b.id}`} cx="35%" cy="32%" r="78%">
            <stop offset="0%" stopColor={b.colorLight} />
            <stop offset="52%" stopColor={b.color} />
            <stop offset="100%" stopColor={b.colorDark} />
          </radialGradient>
        ))}
        <filter id="f-blur6" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="f-blur16" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <clipPath id="clip-jupiter">
          <circle cx="0" cy="0" r={21} />
        </clipPath>
      </defs>

      {/* click on empty space to deselect */}
      <rect width="1000" height="1000" fill="transparent" onClick={() => onSelect(null)} />

      {/* orbit paths */}
      {showOrbits &&
        PLANETS.map((p) => {
          const R = orbitRadiusOf(p.au);
          const active = selectedId === p.id;
          const hot = hoveredId === p.id;
          return (
            <circle
              key={p.id}
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke={
                active
                  ? "rgba(255,209,130,0.55)"
                  : hot
                    ? "rgba(169,191,228,0.4)"
                    : "rgba(148,175,225,0.15)"
              }
              strokeWidth={active ? 1.6 : 1}
              style={{ transition: "stroke 0.25s" }}
            />
          );
        })}

      {/* asteroid belt */}
      <g className="belt">
        {belt.map((p, i) => (
          <circle
            key={i}
            cx={C + p.rad * Math.cos(p.a)}
            cy={C + p.rad * Math.sin(p.a)}
            r={p.r}
            fill="#9aa8c0"
            opacity={p.o}
          />
        ))}
      </g>

      {/* sunline to selected planet */}
      {selectedPos && (
        <line
          x1={C}
          y1={C}
          x2={selectedPos.x}
          y2={selectedPos.y}
          stroke="rgba(255,210,130,0.30)"
          strokeWidth="1"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
      )}

      {/* the Sun */}
      <g
        transform={`translate(${C} ${C})`}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect("sun");
        }}
        onPointerEnter={() => onHover("sun")}
        onPointerLeave={() => onHover(null)}
      >
        <circle r={82} fill="#ff8a1e" opacity={0.16} filter="url(#f-blur16)" className="sun-glow-slow" />
        <circle r={48} fill="#ffab2e" opacity={0.42} filter="url(#f-blur6)" className="sun-glow" />
        <g className={`planet-node${sunHovered ? " is-hover" : ""}${sunSelected ? " is-selected" : ""}`}>
          <circle r={sun.r} fill={`url(#g-sun)`} />
        </g>
        {sunSelected && (
          <circle
            r={sun.r + 12}
            className="select-ring"
            fill="none"
            stroke="#ffd27a"
            strokeWidth="1.3"
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
        )}
        <circle r={44} fill="transparent" />
        {labelVisible(sun) && (
          <text y={-(sun.r + 20)} className={`svg-label${sunSelected ? " svg-label-strong" : ""}`}>
            SUN
          </text>
        )}
      </g>

      {/* planets */}
      {PLANETS.map((p) => {
        const R = orbitRadiusOf(p.au);
        const theta = p.angle0 + (simDays / p.periodDays) * TAU;
        const x = C + R * Math.cos(theta);
        const y = C - R * Math.sin(theta);
        const selected = selectedId === p.id;
        const hovered = hoveredId === p.id;
        const hitR = Math.max(16, p.r + 9);
        const nodeClass = `planet-node${hovered ? " is-hover" : ""}${selected ? " is-selected" : ""}`;

        const ringRx1 = p.r * 2.05;
        const ringRy1 = p.r * 0.66;
        const ringRx2 = p.r * 1.55;
        const ringRy2 = p.r * 0.5;

        let moon: { mx: number; my: number } | null = null;
        if (p.hasMoon) {
          const ma = (simDays / 27.32) * TAU;
          moon = { mx: Math.cos(ma) * 17, my: -Math.sin(ma) * 17 };
        }

        return (
          <g
            key={p.id}
            transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(p.id);
            }}
            onPointerEnter={() => onHover(p.id)}
            onPointerLeave={() => onHover(null)}
          >
            <g className={nodeClass}>
              {/* saturn — back rings */}
              {p.hasRings && (
                <g transform="rotate(-16)" opacity={0.85}>
                  <ellipse rx={ringRx1} ry={ringRy1} fill="none" stroke="#cbb27e" strokeWidth="3.2" opacity="0.65" />
                  <ellipse rx={ringRx2} ry={ringRy2} fill="none" stroke="#a68f5f" strokeWidth="2" opacity="0.5" />
                </g>
              )}

              <circle r={p.r} fill={`url(#g-${p.id})`} />

              {/* jupiter — cloud bands + great red spot */}
              {p.bands && (
                <g clipPath="url(#clip-jupiter)">
                  <rect x={-p.r} y={-p.r * 0.58} width={p.r * 2} height={p.r * 0.2} fill="#8a6238" opacity="0.4" />
                  <rect x={-p.r} y={-p.r * 0.12} width={p.r * 2} height={p.r * 0.26} fill="#eed6a6" opacity="0.5" />
                  <rect x={-p.r} y={p.r * 0.38} width={p.r * 2} height={p.r * 0.2} fill="#8a6238" opacity="0.38" />
                  <ellipse cx={p.r * 0.36} cy={p.r * 0.42} rx={p.r * 0.26} ry={p.r * 0.14} fill="#c1552f" opacity="0.85" />
                </g>
              )}

              {/* saturn — front rings */}
              {p.hasRings && (
                <g transform="rotate(-16)">
                  <path
                    d={`M ${-ringRx1} 0 A ${ringRx1} ${ringRy1} 0 0 0 ${ringRx1} 0`}
                    fill="none"
                    stroke="#dcc58f"
                    strokeWidth="3.2"
                    opacity="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${-ringRx2} 0 A ${ringRx2} ${ringRy2} 0 0 0 ${ringRx2} 0`}
                    fill="none"
                    stroke="#b39a67"
                    strokeWidth="2"
                    opacity="0.6"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* earth's moon */}
              {moon && (
                <>
                  {showOrbits && <circle r={17} fill="none" stroke="rgba(148,175,225,0.22)" strokeWidth="0.7" />}
                  <circle cx={moon.mx} cy={moon.my} r={2.3} fill="#cfd6e4" />
                </>
              )}
            </g>

            {selected && (
              <circle
                r={p.r + 9}
                className="select-ring"
                fill="none"
                stroke="#ffd27a"
                strokeWidth="1.3"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            )}

            {/* generous invisible hit area */}
            <circle r={hitR} fill="transparent" />

            {labelVisible(p) && (
              <text y={-(p.r + 13)} className={`svg-label${selected ? " svg-label-strong" : ""}`}>
                {p.name.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
