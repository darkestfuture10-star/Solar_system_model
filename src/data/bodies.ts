export interface CelestialBody {
  id: string;
  name: string;
  kind: string;
  color: string;
  colorLight: string;
  colorDark: string;
  /** visual radius in svg units */
  r: number;
  /** semi-major axis in AU (0 for the Sun) */
  au: number;
  /** sidereal orbital period in Earth days (0 for the Sun) */
  periodDays: number;
  diameterKm: number;
  distanceMkm: number | null;
  dayLength: string;
  moons: string;
  tempC: string;
  fact: string;
  /** starting orbital angle in radians, so the system looks natural on load */
  angle0: number;
  hasRings?: boolean;
  hasMoon?: boolean;
  bands?: boolean;
}

export const TAU = Math.PI * 2;
export const EARTH_DIAMETER_KM = 12742;
/** simulated Earth-days that elapse per real second at 1× speed */
export const BASE_DAYS_PER_SECOND = 20;
export const SPEED_OPTIONS = [0.5, 1, 2, 5, 10];

/**
 * True distances are compressed with a power curve so that Neptune and
 * Mercury share one screen — the UI flags that nothing is to scale.
 */
export function orbitRadiusOf(au: number): number {
  return 70 + 58 * Math.pow(au, 0.55);
}

export const BODIES: CelestialBody[] = [
  {
    id: "sun",
    name: "Sun",
    kind: "G-type star",
    color: "#ffc84d",
    colorLight: "#fff3c4",
    colorDark: "#ff8a1e",
    r: 30,
    au: 0,
    periodDays: 0,
    diameterKm: 1392700,
    distanceMkm: null,
    dayLength: "25–35 d (varies)",
    moons: "—",
    tempC: "5,505 °C (surface)",
    fact: "The Sun holds 99.86% of all mass in the solar system — every planet, moon and comet combined is a rounding error.",
    angle0: 0,
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "Terrestrial",
    color: "#a89a86",
    colorLight: "#e0d3bd",
    colorDark: "#5f5548",
    r: 5.5,
    au: 0.39,
    periodDays: 88,
    diameterKm: 4879,
    distanceMkm: 57.9,
    dayLength: "58.6 Earth days",
    moons: "0",
    tempC: "167 °C (mean)",
    fact: "A solar day on Mercury — sunrise to sunrise — lasts 176 Earth days, twice as long as its entire year.",
    angle0: 0.9,
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Terrestrial",
    color: "#e6c07a",
    colorLight: "#ffedbe",
    colorDark: "#93682c",
    r: 8.5,
    au: 0.72,
    periodDays: 225,
    diameterKm: 12104,
    distanceMkm: 108.2,
    dayLength: "243 d (retrograde)",
    moons: "0",
    tempC: "464 °C (mean)",
    fact: "Venus spins backwards, so the Sun rises in the west — and one Venus day is longer than its year.",
    angle0: 2.5,
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Terrestrial",
    color: "#3f7fd4",
    colorLight: "#a5dcff",
    colorDark: "#173a75",
    r: 9,
    au: 1,
    periodDays: 365.25,
    diameterKm: 12742,
    distanceMkm: 149.6,
    dayLength: "23.9 hours",
    moons: "1",
    tempC: "15 °C (mean)",
    fact: "Earth is the only place known to hold liquid surface water — and, so far, the only place known to hold life.",
    angle0: 4.3,
    hasMoon: true,
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Terrestrial",
    color: "#d4694a",
    colorLight: "#ffb38a",
    colorDark: "#772916",
    r: 7,
    au: 1.52,
    periodDays: 687,
    diameterKm: 6779,
    distanceMkm: 227.9,
    dayLength: "24.6 hours",
    moons: "2",
    tempC: "−65 °C (mean)",
    fact: "Mars hosts Olympus Mons, a volcano so tall it would tower over Mount Everest nearly three times over.",
    angle0: 5.7,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    color: "#c9a06a",
    colorLight: "#f5dcae",
    colorDark: "#6f4d28",
    r: 21,
    au: 5.2,
    periodDays: 4333,
    diameterKm: 139820,
    distanceMkm: 778.5,
    dayLength: "9.9 hours",
    moons: "95",
    tempC: "−110 °C (cloud tops)",
    fact: "Jupiter's Great Red Spot is a storm wider than Earth that has been raging for at least 190 years.",
    angle0: 1.7,
    bands: true,
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    color: "#d8bd82",
    colorLight: "#f9e9bd",
    colorDark: "#83663a",
    r: 17.5,
    au: 9.58,
    periodDays: 10759,
    diameterKm: 116460,
    distanceMkm: 1434,
    dayLength: "10.7 hours",
    moons: "146",
    tempC: "−140 °C (mean)",
    fact: "Saturn is so light it would float in water — its mean density is only 0.69 g/cm³, less than the oceans.",
    angle0: 3.6,
    hasRings: true,
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    color: "#7fd0d4",
    colorLight: "#d2f6f4",
    colorDark: "#2f7d86",
    r: 12.5,
    au: 19.2,
    periodDays: 30687,
    diameterKm: 50724,
    distanceMkm: 2871,
    dayLength: "17.2 h (retrograde)",
    moons: "28",
    tempC: "−195 °C (mean)",
    fact: "Uranus rolls around the Sun on its side: its axis is tilted 98°, giving each pole 42 years of daylight.",
    angle0: 0.3,
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    color: "#4666d4",
    colorLight: "#a3baff",
    colorDark: "#1c2c6e",
    r: 12,
    au: 30.05,
    periodDays: 60190,
    diameterKm: 49244,
    distanceMkm: 4495,
    dayLength: "16.1 hours",
    moons: "16",
    tempC: "−200 °C (mean)",
    fact: "Neptune's winds top 2,100 km/h — the fastest measured anywhere in the solar system.",
    angle0: 5.1,
  },
];

export const PLANETS = BODIES.filter((b) => b.id !== "sun");

export function fmtInt(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

export function formatPeriod(days: number): { main: string; sub: string } {
  if (days >= 2000) {
    return { main: `${(days / 365.25).toFixed(1)} years`, sub: `${fmtInt(days)} Earth days` };
  }
  return { main: `${days} days`, sub: `${(days / 365.25).toFixed(2)} Earth years` };
}

export function shortPeriod(days: number): string {
  return days >= 2000 ? `${(days / 365.25).toFixed(1)} yr` : `${days} d`;
}

export function formatDistanceMkm(mkm: number): string {
  return mkm >= 1000 ? `${mkm.toLocaleString("en-US")} M km` : `${mkm} M km`;
}
