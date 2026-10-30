# BATMAN PROTOCOL — 30/60-Day Challenge App
## Product brief and implementation instructions for Antigravity

> **Working title:** BATMAN PROTOCOL  
> **Product type:** Mobile-first habit/challenge tracker, installable as an Android APK  
> **Core idea:** Help a person complete a focused 30-day or 60-day personal challenge through daily missions, a to-do list, consistency heat map, progress statistics, and a Batman-inspired “become the hero” progression system.

---

## 1. Build objective

Build a polished, genuinely usable mobile app that feels like a personal mission-control system inspired by Batman: dark, disciplined, tactical, atmospheric, and rewarding. The Batman theme is a motivational wrapper around real habit-building tools—not just a decorative skin.

The user should be able to:
1. Choose a 30-day or 60-day challenge.
2. Define their challenge and daily habits/tasks.
3. View and complete today’s missions.
4. Track completion history on a calendar heat map.
5. See meaningful progress statistics and an estimated completion likelihood.
6. Earn XP, ranks, badges, and unlockable Batman-inspired persona elements as they stay consistent.
7. Install the app on Android from a generated APK, with their data saved locally.

**Important:** Start by inspecting the current workspace and existing project. If it is empty, scaffold the app. If code already exists, preserve useful work and explain the plan before making destructive changes. Do not stop at a mockup: implement working flows, persistence, and a buildable Android package.

---

## 2. Product principles

- **Mobile-first:** Design for a typical Android phone first; adapt gracefully to larger screens.
- **Fast daily use:** A user should be able to check today’s tasks and log progress in seconds.
- **Encouraging, not punishing:** Missed days should not erase all progress or shame the user. Offer a recovery path and “resume protocol” option.
- **Honest analytics:** Never present a made-up “probability of finishing” as scientific certainty. Label it as an estimate, explain its basis, and show “not enough data” early on.
- **Offline-first:** Core features must work without an account or internet connection.
- **Privacy-first:** Store data locally by default. No account, tracking SDK, or cloud sync is required for the MVP.
- **Accessible:** Readable contrast, comfortable tap targets, scalable text, screen-reader labels, and no information conveyed by color alone.
- **No copyrighted assets:** Use original icons, CSS/SVG shapes, and generic Gotham-at-night-inspired atmosphere. Do not bundle Batman film stills, actor likenesses, official logos, or unlicensed comic art. Treat “Batman” as the user’s theme reference; keep the implementation’s assets original and make any public-release trademark/licensing limitations clear.

---

## 3. Recommended implementation approach

First inspect the machine, installed SDKs, and workspace. Choose the most reliable route to a **real installable Android APK** and document the reason.

### Preferred route
- **UI:** React + TypeScript + Vite, mobile-first, with a clean component system.
- **Installable web experience:** PWA manifest and service worker for browser installation.
- **Android package:** Capacitor wrapping the web app, then build a debug APK with Android tooling/Gradle.
- **Styling:** Tailwind CSS or plain CSS variables and reusable components.
- **Charts:** Lightweight chart library or custom SVG/CSS charts.
- **Persistence:** IndexedDB (for a web/PWA build) or a local persistence adapter; ensure Capacitor Android builds use a dependable local store. A small SQLite plugin is acceptable if it works reliably in the chosen Capacitor version.
- **Testing:** Unit tests for date calculations, completion stats, XP, and estimated completion likelihood; basic UI tests where feasible.

If the workspace or environment strongly favors Flutter or native Android and that is the most reliable way to deliver the APK, explain the trade-off and use it instead. Do not mix multiple frameworks without a clear reason.

### Required delivery
- Working source code and sensible project structure.
- `README.md` with setup, development, testing, and Android build steps.
- PWA assets/configuration if using the web route.
- Android wrapper/configuration if using Capacitor.
- A generated APK **if the installed environment supports building it**.
- If the APK cannot be built in the current environment, state exactly what is missing and provide the precise command sequence for the user to build it. Never claim a successful build without verifying the output exists.

---

## 4. Visual direction — “The Batcave”

Create a premium, restrained, cinematic interface. It should feel like a tactical dashboard rather than a generic habit app.

### Palette
- Near-black / graphite background: `#0B0D12`
- Raised panels: `#141821`
- Elevated panel: `#1C2230`
- Main text: `#F3F5F7`
- Secondary text: `#9AA4B2`
- Tactical amber accent: `#E0B34C`
- Optional signal blue: `#6AA9FF`
- Success green: `#5BC69A`
- Danger red, used sparingly: `#E36C70`

Keep the background mostly dark and use amber as a deliberate highlight, not as a flood of bright yellow. Provide a high-contrast accessible state.

### Typography
Use a strong condensed or geometric heading font and a highly legible body font. Prefer locally bundled or system-safe fonts to avoid relying on a network connection. Use large, clear numerals for streaks and progress.

### UI language
- “Today’s Missions”
- “Mission Control”
- “Protocol Day 12 / 30”
- “Consistency”
- “XP”
- “Rank”
- “Recovery Protocol”
- “Challenge Complete”

Avoid making every label a forced Batman reference. The app should remain easy to understand.

### Motion
Use brief, subtle transitions: progress-ring animation, card reveal, rank-up moment, and completion feedback. Respect reduced-motion preferences. No slow intro that blocks daily use.

### Layout
- Bottom navigation with 4–5 destinations.
- Large daily progress indicator on Home.
- Task rows with obvious completion states.
- Rounded but not excessively bubbly cards.
- A responsive calendar heat map that remains usable on narrow screens.
- Empty states with a clear next action.

---

## 5. Primary navigation

Implement these main areas:

1. **Home / Mission Control**
2. **Missions / Tasks**
3. **Heat Map / Calendar**
4. **Stats / Intelligence**
5. **Profile / Batcave**

If five destinations crowd the screen, use four bottom tabs and place Profile in a top-right menu. Keep navigation consistent.

---

## 6. Onboarding and challenge setup

Create a short, skippable onboarding flow.

### Step 1 — Choose duration
- 30 days
- 60 days

Allow the user to start today or select a future start date. Use local timezone dates consistently.

### Step 2 — Name the challenge
Examples:
- “Project Discipline”
- “Fitness Reset”
- “Study Protocol”
- “Build My Portfolio”

These are examples only. Let the user enter their own title and description.

### Step 3 — Select or create habits
Offer a few optional starter templates, but do not force them:
- Study / focused work
- Exercise / movement
- Reading
- Sleep routine
- Skill practice
- Custom habit

Allow each habit to have:
- Name
- Optional description
- Optional daily target or unit (e.g., 20 minutes, 10 pages)
- Active weekdays or every day
- Optional reminder time, with permission only if needed

Do not require every user to have the same habits. Let the user add, edit, archive, and reorder habits.

### Step 4 — Review protocol
Show duration, start/end dates, and selected habits. Ask for confirmation before creating the challenge.

### Rules
- Support one active challenge in the MVP. If the user starts another, offer to finish, archive, or replace the current one rather than silently deleting it.
- A user can pause a challenge; define clearly how paused days affect totals.
- A user can reset or delete a challenge only after a confirmation step.
- Do not allow duplicate taps to create duplicate challenges.

---

## 7. Home screen — Mission Control

The Home screen should answer: “What do I need to do today, and how am I doing?”

### Header
- Greeting or neutral welcome
- Challenge title
- “DAY X OF 30/60”
- Current rank / XP

### Daily progress
- Circular or linear progress display: completed tasks / scheduled tasks
- Percentage for today
- A clear “remaining missions” count

### Today’s Missions
Each task row should include:
- Completion checkbox/button
- Task name
- Optional target
- Optional estimated time
- Optional small category icon
- Clear completed state

Tapping completion should:
- Save immediately.
- Update daily progress and stats.
- Award XP once per task per challenge date.
- Trigger a small, accessible completion animation.
- Support undoing completion without double-awarding XP.

### Quick actions
- Add mission
- View heat map
- Add a note / daily reflection (optional)
- Start “Focus Mode” (a simple distraction-light task view; timer optional)

### Empty state
If there are no tasks for today, show a helpful prompt to add a habit or schedule a mission.

---

## 8. Task and habit system

Distinguish between **habits** (recurring behaviours) and **missions/tasks** (individual to-dos), even if they share a common UI.

### Habit functions
- Create, edit, archive, reorder.
- Set recurrence: daily, selected weekdays, or custom schedule.
- Optional measurable target.
- Mark complete per local calendar day.
- Optional notes.

### Task functions
- Add one-off task with title, optional notes, due date, and optional category.
- Edit, complete, reopen, or delete with confirmation when appropriate.
- Do not automatically mark an overdue task as complete.
- Clearly distinguish a task’s due date from a recurring habit.

### Daily completion rules
- A scheduled habit counts as one opportunity for that day.
- An unscheduled weekday does not count as a miss.
- A one-off task counts toward daily task completion only if its due date is that day, unless the user manually schedules it for another date.
- Avoid double-counting the same completion.
- Use local date keys like `YYYY-MM-DD`; do not calculate challenge days by dividing raw milliseconds, because daylight-saving/timezone boundaries can cause off-by-one errors.
- Keep historical logs when a habit is archived, so past stats remain correct.

---

## 9. Calendar heat map

Build a GitHub-contribution-style heat map adapted to the challenge’s calendar.

### Requirements
- Show all dates in the active 30/60-day challenge.
- Use a grid of days with clear date labels and a legend.
- Intensity should reflect completion rate, not raw task volume, so days remain comparable.
- Suggested levels:
  - No scheduled missions / no data
  - 0% completed
  - 1–49%
  - 50–99%
  - 100%
- Differentiate “no data,” “rest day,” “missed day,” and “future day” in labels or tooltips.
- Tapping a date opens a detail panel with scheduled tasks, completions, and daily rate.
- Add a “today” marker.
- On small screens, support horizontal scrolling or a compact month/list view.
- Include accessible text labels; color must not be the only indicator.

Heat-map data should be derived from saved task/habit logs, not separately hardcoded.

---

## 10. Statistics / Intelligence dashboard

Display understandable metrics with definitions and consistent date boundaries.

### Core metrics
- Overall challenge progress: elapsed challenge days / total days.
- Challenge completion rate: completed scheduled habit opportunities / total scheduled habit opportunities to date.
- Today’s completion rate.
- Total missions completed.
- Active-day count.
- Current streak and best streak.
- XP earned and current rank.
- Daily completion trend.
- Habit-by-habit completion rate.
- Remaining days.
- Challenge status: upcoming, active, paused, completed, archived.

### Streak definition
Write the streak rule in the UI or help panel. Recommended: a streak increments for each consecutive calendar day on which the user meets a configurable daily completion threshold (default 70% of scheduled items). A day with no scheduled missions should not silently count as a successful day; define it as neutral and decide explicitly whether it pauses the streak. Keep the rule consistent across the app and tests.

### Charts
- Daily completion line/bar chart.
- Habit performance chart.
- Completion distribution or summary cards.
- Avoid misleading scales and decorative charts that provide no insight.
- Always provide a textual summary for chart data.

---

## 11. “Probability of finishing” — responsible estimate

The user specifically wants an estimated probability of finishing the challenge. Build this as a transparent **completion likelihood estimate**, not a fake AI prediction.

### MVP method
1. Before enough data exists (recommended: fewer than 5 completed challenge days), display **“Building your baseline”** and explain that there is not enough history for a useful estimate.
2. Calculate a recent consistency rate from the latest 7 eligible challenge days, or all eligible days if fewer than 7. Exclude future days and explicitly paused dates.
3. Calculate a longer-term consistency rate across all eligible elapsed days.
4. Blend recent and overall rates to reduce overreaction to one good or bad day.
5. Map the blended rate to a clearly labelled **heuristic estimate** (0–100%), using a documented, tested formula. Cap/soften extreme values so a tiny sample does not claim certainty.
6. If the app has enough completed history, optionally use a simple simulation of remaining scheduled opportunities. Document assumptions and ensure outputs are reproducible for tests.
7. Show:
   - Estimated likelihood (or “building baseline”)
   - Confidence label: low / moderate / higher, based on amount of history
   - “What affects this?” summary (recent consistency, overall consistency, remaining days)
   - A non-judgmental action such as “Complete today’s next mission to improve your consistency.”

### Example UI copy
“**Estimated completion likelihood: 68%**  
A rough estimate based on your logged consistency so far—not a guarantee. Your recent activity and the number of days remaining can change it.”

### Guardrails
- Do not claim clinical, scientific, or AI accuracy.
- Do not imply a user’s worth or ability is defined by this score.
- Never show 0% or 100% certainty from sparse data.
- Avoid calling a day “failed”; use “missed,” “incomplete,” or “recovery opportunity.”
- Put the calculation and its assumptions in a help/info panel and unit tests.

---

## 12. Batman-inspired progression and unlock system

This is the app’s signature feature: the user is training into a more disciplined “Dark Knight” persona by completing their own real-world missions.

Use original, generic iconography and rank names. Avoid official artwork or logos unless the user later provides licensed assets.

### XP rules (suggested defaults)
- Complete a scheduled habit for the day: +10 XP.
- Complete a one-off mission: +5 XP.
- Complete all scheduled missions for the day: +15 bonus XP.
- Complete a weekly consistency milestone: +30 XP.
- XP can be awarded only once for the same completion event.
- Undoing a completion should reverse the corresponding XP event or recompute XP from the event log; never allow repeated check/uncheck farming.

### Rank progression (example names; tune as needed)
1. Recruit
2. Detective
3. Vigilante
4. Gotham Guardian
5. Dark Knight
6. Legend of Gotham

Ranks should be based on XP and/or meaningful milestones, with thresholds documented in one place. Display the next-rank progress bar and what the next milestone unlocks.

### Unlockable items
- Cowl / mask silhouette variations (original abstract icon)
- Emblem styles (original geometric bat-like motif; avoid copying official Batman logos)
- Profile frames
- Batcave dashboard themes
- Rank titles
- Sound/visual completion effects, off by default or user-controlled

Unlocks are cosmetic and motivational; they must never block core task tracking.

### Persona reveal / “unlock Batman in you”
At the beginning, show a restrained locked silhouette or abstract emblem. As the user progresses, gradually reveal additional layers, light, and detail. At a milestone (e.g., first 7 active days or first 100 XP), trigger a small reveal screen:
“You’re not waiting to become disciplined. You’re building it—mission by mission.”

Make it possible to reduce or skip animation. Do not make the user lose already-earned unlocks after a missed day.

### Rewards and streak recovery
- Reward effort and returning, not only perfect streaks.
- Add a “Recovery Protocol” button after missed days: reschedule tasks, reduce today’s load, or simply resume.
- No XP punishment for a missed day.
- Never remove unlocked cosmetics because of a missed day.

---

## 13. Reminders and notifications

Optional for the MVP; implement only if it is reliable on the chosen platform.

- User can select reminder time and turn reminders off.
- Ask notification permission only after the user enables reminders, not at first launch.
- Respect Android permission requirements and PWA/browser limitations.
- Do not send multiple reminders for the same event.
- If dependable local notifications cannot be implemented, leave a clear extension point and document the limitation rather than presenting a non-working toggle.

---

## 14. Data model and persistence

Use a typed, versioned schema. Suggested entities:

### Challenge
- `id`
- `title`
- `description`
- `durationDays` (30 or 60)
- `startDate` (`YYYY-MM-DD`)
- `status` (`upcoming | active | paused | completed | archived`)
- `pausedDateRanges` or equivalent explicit pause log
- `createdAt`
- `updatedAt`

### Habit
- `id`
- `challengeId`
- `name`
- `description`
- `targetValue` (optional)
- `targetUnit` (optional)
- `schedule` (daily / weekdays / custom weekdays)
- `activeFrom`
- `archivedAt` (optional)
- `sortOrder`

### Task
- `id`
- `challengeId`
- `title`
- `notes` (optional)
- `dueDate` (`YYYY-MM-DD`)
- `status`
- `category` (optional)
- `createdAt`
- `completedAt` (optional)

### Daily log / completion event
- `id`
- `challengeId`
- `habitId` or `taskId`
- `date` (`YYYY-MM-DD`)
- `completed`
- `completedAt` (optional)
- `notes` (optional)
- `xpEventId` or deterministic event key to prevent duplicates

### User profile / progression
- `xp` or preferably recomputable XP event ledger
- `unlockedItems`
- `selectedCosmetic`
- `settings` (theme, reminders, reduced motion, streak threshold)

### Data rules
- Persist every meaningful change immediately.
- Show a clear loading, error, and empty state.
- Add data schema version and migration strategy.
- Provide export/import backup as JSON if feasible; validate imports and ask before overwriting current data.
- Add a “Delete all local data” option behind confirmation.
- Do not send private habit data to an external server in the MVP.

---

## 15. Important edge cases

Test and handle:
- App closes and reopens after task completion.
- Offline launch and use.
- Midnight rollover and local timezone changes.
- Daylight-saving transitions where applicable.
- Challenge starts in the future.
- Challenge reaches its end date.
- Challenge is paused and resumed.
- Habit schedule changes halfway through a challenge.
- Habit is archived but its history remains visible.
- A task is edited, reopened, or completed twice.
- User rapidly taps completion multiple times.
- A missed day followed by a return.
- No scheduled tasks on a particular date.
- Corrupt or invalid imported backup.
- Small phone viewport and large accessibility font.
- User changes duration or start date after progress exists; require confirmation and recalculate safely.

---

## 16. Suggested screen list

Implement the following screens or equivalent routes:

1. **Splash / first launch** — quick logo mark and transition, skippable.
2. **Onboarding** — duration, challenge name, habits, review.
3. **Mission Control** — daily overview, progress, missions, XP/rank.
4. **All Missions** — task list with add/edit and filters.
5. **Add/Edit Mission** — accessible form and validation.
6. **Habits** — recurring habits and schedules.
7. **Heat Map** — 30/60-day history and day details.
8. **Intelligence / Stats** — completion, streak, trend, estimated likelihood.
9. **Profile / Batcave** — rank, XP, unlocks, cosmetics, settings.
10. **Recovery Protocol** — resume after missed days.
11. **Settings / Data** — reminders, reduced motion, export/import, reset/delete.

Use bottom sheets or dialogs for small actions where appropriate rather than navigating to a new page for every tiny task.

---

## 17. MVP scope and build order

Prioritize a complete, reliable MVP over a large unfinished feature set.

### Phase 1 — Foundation
- Inspect workspace/environment.
- Scaffold app and theme.
- Configure routing/navigation.
- Define typed data model and local persistence.
- Add date utility functions and tests.

### Phase 2 — Core challenge loop
- Onboarding and create challenge.
- Create/edit habits and one-off missions.
- Mission Control daily view.
- Completion toggles, undo, persistence.
- Correct daily and challenge progress calculations.

### Phase 3 — Retention and insight
- Calendar heat map with date details.
- Stats dashboard, streaks, habit breakdown.
- Transparent completion-likelihood estimate.
- XP ledger, ranks, unlocks, persona reveal.
- Recovery Protocol.

### Phase 4 — Polish
- Responsive/mobile accessibility pass.
- Empty/loading/error states.
- Offline/PWA support.
- Export/import and settings.
- Optional notifications only if working.

### Phase 5 — Android delivery
- Configure Android wrapper.
- Build debug APK.
- Install/run if the environment allows.
- Verify key flows on emulator/device if available.
- Report exact APK path, build command, and any remaining limitations.

Do not spend the entire effort on the splash screen or visual effects before the challenge/task loop works.

---

## 18. Acceptance criteria

The MVP is not complete until all of these are true:

- [ ] User can create a 30-day challenge.
- [ ] User can create a 60-day challenge.
- [ ] Start/end dates and current challenge day are correct.
- [ ] User can add, edit, archive, and schedule habits.
- [ ] User can add, edit, complete, reopen, and delete one-off tasks.
- [ ] Daily completion state persists after restart.
- [ ] Progress percentages use scheduled opportunities, not unscheduled days.
- [ ] Heat map reflects actual saved logs and opens date details.
- [ ] Stats agree with raw completion data.
- [ ] Streak rules are consistent and tested.
- [ ] Completion likelihood says “building baseline” when data is insufficient and explains its heuristic.
- [ ] XP cannot be farmed by repeated taps or toggling.
- [ ] Ranks and unlocks persist and do not disappear after a missed day.
- [ ] Recovery Protocol offers a supportive way to resume.
- [ ] App works offline for core flows.
- [ ] No external account is required for the MVP.
- [ ] No fake buttons or dead-end navigation remain.
- [ ] No private user data is sent to a server by default.
- [ ] README has accurate setup and build instructions.
- [ ] APK is generated and verified, or the precise blocker is documented.

---

## 19. Working instructions for Antigravity

Act as a senior mobile product engineer and UI designer.

1. **Inspect before editing.** List the current files, runtime, SDKs, and available build tools.
2. **Write a brief implementation plan** and identify any environment blockers.
3. **Choose the simplest stack that produces a reliable Android APK.**
4. **Implement the app in small, testable phases.** Do not only provide code snippets or a design proposal.
5. **Use real data and working interactions.** Avoid placeholder stats, fake heat-map cells, and buttons that do nothing.
6. **Keep business logic separate from UI.** Date math, XP, streaks, and likelihood estimates should be pure functions with tests.
7. **Run checks.** Execute tests, lint/type checks, and a production build. Fix errors before claiming completion.
8. **Verify persistence** by creating a challenge, completing a mission, restarting, and confirming the state remains.
9. **Build the APK** if the environment supports it. Verify the file exists and report its exact path.
10. **Keep a concise `IMPLEMENTATION_STATUS.md`** listing completed features, commands run, test results, APK status, and known limitations.
11. **Do not ask me to make low-impact decisions.** Use the defaults in this brief. Ask only when a decision is genuinely blocking or could cause destructive changes.
12. **At the end, report:** stack chosen and why, features implemented, tests/build results, APK path or exact blocker, how to run the project, and the next 3 most valuable improvements.

### Final product bar
It should feel like a carefully designed, dark, tactical, premium mobile app—not a generic CRUD template with a Batman wallpaper. The daily challenge loop must be satisfying, analytics must be honest, the data must persist, and the Android installation path must be real.
