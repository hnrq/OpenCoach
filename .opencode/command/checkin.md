---
description: Record today's anthropometric measurements (weight, body fat %, tape sites)
tags: [coaching, checkin, measurements, opencoach]
---

Run the weekly check-in script to collect and save today's measurements:

```bash
pnpm opencoach checkin
```

This writes `measures/measures-YYYY-MM-DD.json` at the repo root with today's date.
Run this before `/appointment` each week.
