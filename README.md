# BATMAN PROTOCOL — 30/60-Day Challenge & Habit Mission Control

A dark, disciplined, tactical mobile-first habit tracker and personal mission-control system inspired by Batman's Batcave telemetry.

Built with **React 18 + TypeScript + Vite + Tailwind CSS** as an offline-first **Progressive Web App (PWA)**, pre-configured for **Capacitor Android packaging**.

---

## 🦇 Product Overview

The Batman theme is a motivational wrapper around real habit-building tools. The app helps users execute a focused 30-day or 60-day challenge through:
- **Mission Control**: Daily habits checklist, target metrics, one-off assignments, and Focus Sprint timer.
- **Calendar Heat Map**: GitHub-style visual consistency matrix adapted for 30/60 days with 5 completion bands and day-by-day telemetry logs.
- **Tactical Intelligence**: Unbroken streak tracker (70% qualification threshold), habit breakdown, and an **honest, transparent completion likelihood heuristic** (no fake AI predictions).
- **The Batcave Vault**: Deterministic XP ledger (prevents farming abuse), 6-tier military/detective ranks, unlockable Cowl Silhouettes, and persona milestone reveals.
- **Recovery Protocol**: Supportive, non-punishing return path after missed days with zero XP loss.
- **Data Safeguards**: 100% offline local persistence with JSON backup export and restore.
- **Tactical Synthesizer Audio**: Crisp, low-latency micro-clicks, checkmark chimes, rank-up fanfare, and timer bells using Web Audio API (zero audio files needed).

---

## 🛠️ Stack & Architecture

- **UI Framework**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React + custom vector Bat Insignia & Cowl Silhouettes
- **Build Tool**: Vite 5 + Custom resolve plugin (guaranteeing cross-platform resolution)
- **Sound**: Web Audio API Synthesizer (instant, 100% offline)
- **Persistence**: LocalStorage with versioned schema (v1) and JSON backup/restore
- **Test Suite**: Native Node ESM runner + strict assertions (100% pass rate in ~125ms)
- **Deployment**: Standalone PWA (Service Worker + Web App Manifest) and Capacitor Android configuration

---

## 🚀 Getting Started

### 1. Local server
To launch the verified production build locally:
```bash
npm run dev
```
Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in your browser or mobile emulation mode.

> This workspace currently sits in a folder named `app #1`. Vite cannot reliably transform JSX in dev mode when the physical project path contains `#`, so `npm run dev` deliberately builds and serves the production bundle instead. This gives the same app behavior as deployment. Rename the folder to something without `#` (for example, `app-1`) if you need hot-module reload during development.

### 2. Run Tests
To verify all date math, XP logic, streak calculations, and completion likelihood heuristics:
```bash
npm test
```

### 3. Build for Production
To typecheck and compile the optimized production bundle:
```bash
npm run build
```
Compiled output will be placed in the `dist/` directory.

---

## 📱 PWA Mobile Installation

1. Open the application URL in **Chrome** (Android) or **Safari** (iOS).
2. Tap the browser menu (or share icon on iOS) and select **"Add to Home Screen"** or **"Install App"**.
3. Launch from your home screen for full standalone fullscreen experience with offline capability.

---

## 🤖 Android APK Build Instructions (via Capacitor)

The workspace is pre-configured with `capacitor.config.json`. To build an installable Android APK on any machine or CI with the Android SDK / Java JDK:

```bash
# 1. Install Capacitor Android dependencies
npm install @capacitor/core @capacitor/android @capacitor/cli

# 2. Build the web bundle
npm run build

# 3. Add Android platform & sync
npx cap add android
npx cap sync

# 4. Compile the Debug APK
cd android
./gradlew assembleDebug
```
The APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛡️ License & Assets Note
All vector insignias, cowl silhouettes, and UI elements in this project are original geometric artwork and do not bundle copyrighted movie stills, comic art, or trademarked assets.
