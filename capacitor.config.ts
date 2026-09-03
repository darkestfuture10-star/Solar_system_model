import type { CapacitorConfig } from "@capacitor/cli";

/*
 * Capacitor config — wraps the built web app (webDir: "dist") in a
 * native Android shell. NOT used by the web build; only by `npx cap …`.
 *
 * TOMORROW'S RUNBOOK (full version in README → "Android"):
 *   1. change appId below to a reverse-domain you own
 *   2. npm run build
 *   3. npx cap add android     (once — creates the android/ project)
 *   4. npx cap sync android    (after every web build)
 *   5. npx cap open android    (Android Studio → ▶ Run)
 */
const config: CapacitorConfig = {
  appId: "com.example.theorrery", // ⚠ change before shipping
  appName: "The Orrery",
  webDir: "dist",
  // matches the app's space-black so there's no white flash at boot
  backgroundColor: "#04070f",
};

export default config;
