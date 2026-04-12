#!/bin/bash

# OpenCoach Skill Router
# Dispatches commands to the appropriate scripts (TS or Bash)

COMMAND=$1
shift # Shift arguments to pass the rest to the scripts

SKILL_DIR=$(dirname "$0")
SCRIPTS_DIR="$SKILL_DIR/scripts"

case $COMMAND in
  save-session)
    # Usage: opencoach save-session <type> --date YYYY-MM-DD
    #        opencoach save-session <type> <file_path>
    #        opencoach save-session all --date YYYY-MM-DD
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-save-session.ts" "$@"
    ;;
  new-session)
    # Usage: opencoach new-session <type> --date YYYY-MM-DD [--force]
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-new-session.ts" "$@"
    ;;
  commit-session)
    # Usage: opencoach commit-session --date YYYY-MM-DD [--dry-run] [--include-extra]
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-commit-session.ts" "$@"
    ;;
  update-profile-from-appointment)
    # Usage: opencoach update-profile-from-appointment --date YYYY-MM-DD [--apply]
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-update-profile.ts" "$@"
    ;;
  get-metric)
    # Usage: opencoach get-metric <type> <metric_path> [n]
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-get-metric.ts" "$@"
    ;;
  analyze-progress)
    # Usage: opencoach analyze-progress
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-analyze-progress.ts" "$@"
    ;;
  import-pdf)
    # Usage: opencoach import-pdf <pdf_file_path>
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-import-pdf.ts" "$@"
    ;;
  setup-profile)
    # Usage: opencoach setup-profile
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-setup-profile.ts" "$@"
    ;;
  setup-notes)
    # Usage: opencoach setup-notes
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-setup-athlete-notes.ts" "$@"
    ;;
  checkin)
    # Usage: opencoach checkin
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-checkin.ts" "$@"
    ;;
  --help|-h|help)
    echo ""
    echo "Usage: opencoach <command> [options]"
    echo ""
    echo "Data commands:"
    echo "  save-session <type> --date YYYY-MM-DD       Validate + save session (in-place)"
    echo "  save-session <type> <file_path>             Validate source file, write to <type>/<type>-<today>.json"
    echo "  save-session all --date YYYY-MM-DD          Validate measures + diet + training in one command"
    echo "  new-session <type> --date YYYY-MM-DD        Generate schema-valid JSON skeleton"
    echo "  commit-session --date YYYY-MM-DD            Stage only allowed session files for date"
    echo "  update-profile-from-appointment --date ...  Preview/apply preference changes to profile.json"
    echo ""
    echo "  Types for save-session / new-session:"
    echo "    measures | diet | training | appointment | all"
    echo ""
    echo "Analysis commands:"
    echo "  analyze-progress                            Calculate WROC + adjustment recommendations"
    echo "  get-metric <type> <path> [n]                Fetch last N values for a metric"
    echo "  checkin                                     Interactive weekly check-in (measures)"
    echo ""
    echo "Setup commands:"
    echo "  setup-profile                               Initialize or update profile.json"
    echo "  import-pdf <path>                           Import data from a PDF document"
    echo ""
    echo "Options:"
    echo "  --help    Show help for any command (e.g. opencoach save-session --help)"
    echo ""
    echo "Examples:"
    echo "  opencoach new-session diet --date 2026-04-05"
    echo "  opencoach save-session diet --date 2026-04-05"
    echo "  opencoach save-session all --date 2026-04-05"
    echo "  opencoach commit-session --date 2026-04-05 --dry-run"
    echo "  opencoach update-profile-from-appointment --date 2026-04-05 --apply"
    echo ""
    ;;
  *)
    echo "Error: unknown command '${COMMAND}'"
    echo ""
    echo "Run  opencoach --help  to see available commands."
    exit 1
    ;;
esac
