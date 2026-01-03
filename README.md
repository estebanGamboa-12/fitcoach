# FitCoach (local-only demo)

A fictitious fitness coaching app built with Expo, React Native, and TypeScript. The app is fully offline and stores everything locally using AsyncStorage. It includes both a **Coach** and **Client** experience inside the same app.

## Getting started

```bash
npm install
npm run start
```

Run on iOS/Android from the Expo CLI.

## What the app does

- **Cliente** tab: shows the weekly workout assignments and lets the client log sets (kg/reps/RPE) in a workout player.
- **Entrenador** tab: edit the weekly plan, change which workouts are assigned to each day, and manage workout templates.
- **Ajustes** tab: reset the demo data or export client logs.

Everything is stored locally on the device. There is no backend or network activity.

## Mock data

Mock plan data lives in `src/lib/mockPlan.ts`. It creates:

- One client named **"Cliente Demo"**
- 3 workouts (Push/Pull/Legs)
- Assignments for the next 7 days

## Reset / Import / Export

- **Reset demo:** `Restablecer demo` in the Coach or Settings tab.
- **Export plan:** `Exportar plan JSON` in the Coach tab.
- **Import plan:** `Importar plan JSON` in the Coach tab.
- **Export logs:** `Exportar logs JSON` in the Settings tab.

All imports/exports are local file-based using the device share sheet.
