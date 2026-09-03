/*
 * Starfield.tsx — the ambient background behind the simulation.
 * Pure decoration: zero props, zero state, pointer-events: none.
 *
 * LAYER STACK (bottom → top):
 *   1. base wash      — one radial gradient: deep blue at the Sun's
 *                       position, near-black at the edges
 *   2. nebula tints   — three huge blurred color blobs (teal / rust /
 *                       slate) so the void isn't uniformly black
 *   3. star layer     — 180 SVG circles on a slightly oversized div
 *                       (.starfield-drift in index.css rotates the whole
 *                       layer once every 9 minutes; ~16% of stars also
 *                       twinkle individually via the .tw class)
 *   4. vignette       — darkens the corners to pull the eye to the Sun
 *
 * NOTES FOR THE NEXT PERSON:
 *  - memo() + useMemo(): star positions are rolled once per mount and
 *    never again, so the parent re-rendering 60×/s costs nothing here.
 *  - the star layer is inset -18% on purpose — a rotating rectangle
 *    reveals its corners otherwise. Don't "fix" the overscan.
 *  - twinkle speed/delay are passed to CSS as custom properties
 *    (--tw-dur / --tw-del), consumed by .tw in index.css.
 */

import { memo, useMemo, type CSSProperties } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  tw: boolean;
  dur: number;
  del: number;
}

const Starfield = memo(function Starfield() {
  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    for (let i = 0; i < 180; i++) {
      arr.push({
        x: Math.random() * 1600,
        y: Math.random() * 1000,
        r: 0.4 + Math.random() * 1.15,
        o: 0.12 + Math.random() * 0.6,
        tw: Math.random() < 0.16,
        dur: 2.8 + Math.random() * 5.5,
        del: Math.random() * 7,
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* deep-space base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, #0b1428 0%, #070d1c 42%, #04070f 100%)",
        }}
      />
      {/* faint nebula tints */}
      <div
        className="absolute -left-[12%] -top-[18%] h-[75%] w-[62%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 45%, rgba(43,102,124,0.20), rgba(43,102,124,0.05) 55%, transparent 72%)",
        }}
      />
      <div
        className="absolute -bottom-[22%] -right-[10%] h-[70%] w-[58%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 55% 55%, rgba(140,74,38,0.14), rgba(140,74,38,0.04) 55%, transparent 72%)",
        }}
      />
      <div
        className="absolute left-[30%] top-[55%] h-[42%] w-[40%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(52,74,140,0.10), transparent 68%)",
        }}
      />

      {/* slowly rotating star layer — oversized so rotation never reveals edges */}
      <div className="starfield-drift absolute -inset-[18%]">
        <svg
          className="h-full w-full"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              /* every 9th star warm, every 7th blue, the rest white —
                 cheap way to get color temperature variation */
              fill={i % 9 === 0 ? "#ffe9c0" : i % 7 === 0 ? "#bcd2ff" : "#e8f0ff"}
              opacity={s.o}
              className={s.tw ? "tw" : undefined}
              style={
                s.tw
                  ? ({ "--tw-dur": `${s.dur}s`, "--tw-del": `${s.del}s` } as CSSProperties)
                  : undefined
              }
            />
          ))}
        </svg>
      </div>

      {/* vignette to focus the eye on the system */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(2,4,10,0.55) 100%)",
        }}
      />
    </div>
  );
});

export default Starfield;
