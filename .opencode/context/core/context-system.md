<!-- Context: core/context-system | Priority: critical | Version: 1.1 | Updated: 2026-03-28 -->

# Context System

**Purpose**: Minimal, concern-based knowledge organization for OpenCoach.

---

## Core Principles

### 1. Minimal Viable Information (MVI)
Extract only core concepts (1-3 sentences), key points (3-5 bullets), minimal example, and reference link. 
**Goal**: Scannable in <30 seconds.

### 2. Function-Based Structure
Organize by **what the information does**:
```
category/
├── navigation.md
├── concepts/              # What it is (Methodology)
├── examples/              # Working code/data
├── guides/                # How to do it (Workflows)
├── lookup/                # Quick reference (Macros/Exercises)
└── errors/                # Common issues (Stalls/Injuries)
```

### 3. Token-Efficient Navigation
Every category has `navigation.md` with:
- **ASCII tree** for quick structure scan.
- **Quick routes table** for common tasks.
