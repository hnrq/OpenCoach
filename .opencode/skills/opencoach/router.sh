#!/bin/bash

# OpenCoach Skill Router
# Dispatches commands to the appropriate scripts (TS or Bash)

COMMAND=$1
shift # Shift arguments to pass the rest to the scripts

SKILL_DIR=$(dirname "$0")
SCRIPTS_DIR="$SKILL_DIR/scripts"

case $COMMAND in
  save-session)
    # Usage: ./router.sh save-session <type> <file_path>
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-save-session.ts" "$@"
    ;;
  get-metric)
    # Usage: ./router.sh get-metric <type> <metric_path> [n]
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-get-metric.ts" "$@"
    ;;
  analyze-progress)
    # Usage: ./router.sh analyze-progress
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-analyze-progress.ts" "$@"
    ;;
  generate-diet)
    # Usage: ./router.sh generate-diet
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-generate-diet.ts" "$@"
    ;;
  generate-training)
    # Usage: ./router.sh generate-training
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-generate-training.ts" "$@"
    ;;
  import-pdf)
    # Usage: ./router.sh import-pdf <pdf_file_path>
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-import-pdf.ts" "$@"
    ;;
  setup-profile)
    # Usage: ./router.sh setup-profile
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-setup-profile.ts" "$@"
    ;;
  checkin)
    # Usage: ./router.sh checkin
    /home/dalborga/.bun/bin/bun run "$SCRIPTS_DIR/coach-checkin.ts" "$@"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Usage: ./router.sh {save-session|get-metric|analyze-progress|generate-diet|generate-training|import-pdf|setup-profile|checkin}"
    exit 1
    ;;
esac
