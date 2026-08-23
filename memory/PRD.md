# HabitLoop — Product Requirements & Progress

## Original Problem Statement
Build a polished, production-ready, mobile-first habit tracking app (**HabitLoop**). Users create unlimited custom habits (duration or reps/count), log daily progress, and view history/streaks/stats. Local single-user app for v1 — no accounts, no cloud sync, no push notifications. Data persists on-device.

## User Choices
- Storage: **Fully local on-device only** (offline-first).
- Visual style: **Bold & playful** (vibrant emerald/sky accents, chunky cards, big emoji icons).
- Heatmap/streak accent: agent-picked → **emerald green** GitHub-style tiers.
- Constraint: keep it **lightweight for Android** long-term.

## Architecture
- **Frontend**: Expo (React Native) + expo-router file-based routing. No backend.
- **Persistence**: `@/src/utils/storage` (AsyncStorage). Keys: `habitloop_habits_v1`, `habitloop_logs_v1`, `habitloop_seeded_v1`. Arrays stored as JSON strings; written on every mutation.
- **State**: `HabitProvider` (React context) in `src/store/HabitStore.tsx` — single source of truth.
- **Theme**: `src/theme/index.tsx` — light/dark palettes following system scheme, spacing/radius/font tokens. Fonts: Figtree (display) + Nunito (body) via expo-font (local TTFs in assets/fonts).
- **Libs**: react-native-svg (rings/charts), react-native-keyboard-controller (form), expo-haptics.

## Data Models
- Habit: `{ id, name, icon(emoji), category, tracking_type('duration'|'reps'), target_value(number|null), color, created_at, archived(bool) }`
- LogEntry: `{ id, habit_id, date('YYYY-MM-DD'), value, created_at }` — one entry per habit per date.
- Completion rule: `value >= target` (or `value > 0` if no target).

## User Personas
- **The self-improver**: wants a frictionless daily log and motivating streaks without setup overhead.

## Navigation
Bottom tabs (custom playful bar): **Today** (default) · **Habits** · **Stats**. Modal: `habit-form` (add/edit). Stack: `habit/[id]` (detail).

## Implemented (2026-06 / initial build)
- [x] 4 pre-seeded habits on first launch (Pushups, Reading, Walking/Steps, Water Intake).
- [x] Habit CRUD: add (duration & reps), edit, archive/unarchive (soft-delete keeps history), hard-delete with confirm.
- [x] Emoji picker, tracking-type toggle, optional target, preset + custom category tags.
- [x] Today screen: cards with progress ring, quick-log steppers (+1/+5/+10 reps or scaled +100/+500/+1000 for large targets; +15m/+30m duration), manual entry modal, pop animation + success haptic/toast on completion.
- [x] Habit detail: date strip backdating, per-date logging, current & longest streak badges, GitHub-style heatmap, 7/30-day bar chart toggle.
- [x] Stats tab: weekly completion ring %, habits-completed-per-day bar chart, per-habit comparison rows (done/total + On track/Keeping up/Slipping).
- [x] Light & dark mode, friendly empty states, testIDs throughout.
- [x] Persistence verified across reload. Testing agent: 15/15 flows PASS.

## Backlog
- P1: Optional migrate RN-web `shadow*` → `boxShadow` (cosmetic web-only warning).
- P2: Habit reordering (drag), weekly goal (X days/week) target type, CSV export/backup.
- P2: More chart types on detail (line chart), month labels on heatmap.

## Next Tasks
- Await user feedback; polish per requests.
