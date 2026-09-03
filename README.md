# 🪐 The Orrery — Interactive Solar System

An interactive learning demo of the solar system: the Sun and all eight planets orbiting with their **real relative periods**, rendered as a single SVG. Click any world to open its dossier — name, size, distance from the Sun, orbital period, day length, moons, temperature and a field note.

**Controls:** play/pause · speed (×0.5 – ×10) · orbit-path & label toggles · reset.
**Keyboard:** `Space` play/pause · `+`/`−` speed · `Esc` close dossier.

> Sizes and distances are compressed for readability (Neptune and Mercury have to share one screen). The app says so on-screen; orbital *periods* are the real thing.

---

## Stack

- **React 18 + TypeScript**, **Vite**, **Tailwind CSS v4**
- No chart/animation/icon libraries — the simulation is plain SVG + `requestAnimationFrame`, icons are inline SVG.

## Reading the repo

```
index.html                      shell — fonts + pre-paint dark background
src/
  main.tsx                      React entry point
  index.css                     design tokens (@theme) + EVERY animation
  App.tsx                       conductor — all state, layout, clock, shortcuts
  data/
    bodies.ts                   ★ single source of truth: all planetary data
  components/
    Starfield.tsx               ambient backdrop (wash, nebulae, drifting stars)
    Orrery.tsx                  ★ the simulation (SVG map, planet positions)
    InfoPanel.tsx               right-hand dossier / body index
    Controls.tsx                footer: play/pause, speed, toggles, clock
```

Each file opens with a block comment explaining its job and the gotchas inside — read those first.

## How the simulation works

One number drives everything: `simDays` (simulated Earth days), accumulated in a `requestAnimationFrame` loop in `App.tsx`:

```
simDays += realSeconds × BASE_DAYS_PER_SECOND × speed
```

Every planet's position is a pure function of that clock:

```
θ = angle0 + (simDays / periodDays) × 2π
x = C + R·cos θ      y = C − R·sin θ      (minus → counter-clockwise, like reality)
```

Because all planets divide the *same* clock by their *real* period, relative speeds are exact — Mercury laps Earth ~4.15 times, Neptune barely moves. The dossier's "orbits completed" counter uses the same division, so it never disagrees with what you see.

`R` (orbit radius on screen) compresses true distance with `70 + 58 × au^0.55` so the outer system fits — see `orbitRadiusOf()` in `src/data/bodies.ts`.

## How to add a body (e.g. Pluto)

1. Push an object into `BODIES` in `src/data/bodies.ts` with a unique `id`, real `au` + `periodDays`, a visual radius `r` (5–21), three gradient colors, and a starting angle `angle0`.
2. Done. It automatically appears in the map, the index list, and the mobile quick-pick strip — no component changes needed.

## Tuning knobs

| Knob | Where | Effect |
|---|---|---|
| `BASE_DAYS_PER_SECOND` | `data/bodies.ts` | how many sim-days pass per real second at 1× (default 20) |
| `SPEED_OPTIONS` | `data/bodies.ts` | the footer's multiplier buttons |
| `orbitRadiusOf()` | `data/bodies.ts` | distance compression curve |
| `@theme` colors/fonts | `index.css` | retheme the entire app |
| animation registry | `index.css` | every keyframe, with a note on who uses it |

## Gotchas (asked to be written down)

- **`transform-box: fill-box`** in `index.css` is what makes SVG planets scale in place on hover. Remove it and they fly off-screen.
- The **invisible hit circle** around each planet (min 16 svg units, in `Orrery.tsx`) is the real click target — without it Mercury is untappable on touch.
- The starfield layer is intentionally **oversized 18%** so its CSS rotation never shows corners.
- `key={body.id}` on the dossier scroller is what replays the slide-in animation when switching planets.
- The rAF loop reads `playing`/`speed` through **refs** on purpose — restarting the effect on every toggle would cause a time jump.

## → Android

The repo ships ready for two routes: **Capacitor** (real APK, works offline) and the **PWA/TWA** path (site installed via Chrome). Both start from the same `npm run build` output.

### Zero-setup smoke test (PWA)

1. `npm run build`, then deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages…).
2. Open it in Chrome on a phone → menu → **Install app / Add to Home screen**.

You get a full-screen, icon-on-home-screen app with offline support — that's `public/manifest.webmanifest` + `public/sw.js` doing their job. Same trick later becomes a Play-Store listing via [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (Trusted Web Activity) if you'd rather update by redeploying the site.

### Real APK via Capacitor (recommended)

**You need:** [Android Studio](https://developer.android.com/studio) (it bundles JDK 17 and the Android SDK — accept every installer prompt). A phone with USB debugging, or the bundled Pixel emulator.

```bash
npm run build
npx cap add android      # once — generates the android/ project
npx cap sync android     # after every web build — copies dist/ in
npx cap open android     # opens Android Studio → press ▶ Run
```

- Change `appId` in `capacitor.config.ts` to a reverse-domain you own before the first `cap add`.
- **Launcher icon:** the generated project uses a generic icon. Export `public/icons/icon.svg` as a 1024×1024 PNG and run `npx @capacitor/assets generate --android` to build proper adaptive icons.
- **Play Store:** one-time $25 developer account, then Android Studio → Build → Generate Signed App Bundle (AAB). The app needs no permissions and no backend, so review is usually painless.
- **Git:** commit the generated `android/` folder (it *is* the project); ignore its `.gradle/`, `build/` and `app/build/` output dirs.

### Why not rewrite it natively?

The whole app is one SVG driven by a clock — nothing here benefits from Kotlin, and you'd lose the web version. Capacitor keeps one codebase and ships both.
