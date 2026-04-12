import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-setup-athlete-notes.ts
 * Ensures .opencode/context/coaching/athlete-notes.md exists with standard sections.
 */

const NOTES_PATH = path.join(process.cwd(), '.opencode', 'context', 'coaching', 'athlete-notes.md');
const PROFILE_PATH = path.join(process.cwd(), 'profile.json');

function main() {
  const profile = fs.existsSync(PROFILE_PATH) ? JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8')) : {};
  const athleteName = profile.name || 'Unknown Athlete';

  if (fs.existsSync(NOTES_PATH)) {
    console.log(`Athlete notes already exist at ${NOTES_PATH}`);
    return;
  }

  const boilerplate = `<!-- Context: coaching/athlete-notes | Priority: concept-level | Updated: ${new Date().toISOString().split('T')[0]} -->
<!-- Load alongside profile.json — this file captures what profile.json cannot: observations, patterns, history -->

# Athlete Notes — ${athleteName}

Free-text observations accumulated across appointments. Each entry should be a dated bullet.
Agents: append after every appointment if anything non-obvious was noted. Do not remove old entries.

---

## Food Preferences

**Primary ingredient list** (the backbone of every meal plan — no ingredient outside this list without Head Coach approval):

- (none recorded yet)

**Fixed meals** (non-negotiable — appear on every day type unchanged):

- (none recorded yet)

**Notes**:
- (none recorded yet)

---

## Dietary Observations

- (none recorded yet)

## Equipment Available

- (none recorded yet - list gym equipment here, e.g., barbell, dumbbells, cables)

---

## Training Observations

- (none recorded yet)

## Metabolic / Progress Notes

- (none recorded yet)

## Athlete Preferences & Overrides

- (none recorded yet)

## Upcoming Events / Context

- (none recorded yet)
`;

  const dir = path.dirname(NOTES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(NOTES_PATH, boilerplate);

  console.log(`Created athlete notes at ${NOTES_PATH}`);
}

main();
