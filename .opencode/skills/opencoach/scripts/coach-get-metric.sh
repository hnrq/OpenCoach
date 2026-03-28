#!/bin/bash

# coach-get-metric <type> <metric_path> <n>
# type: measures, diet, or training
# metric_path: jq path to the metric (e.g., .core_metrics.weight)
# n: number of most recent files to fetch

TYPE=$1
METRIC=$2
N=${3:-1}

if [[ -z "$TYPE" || -z "$METRIC" ]]; then
  echo "Usage: coach-get-metric <type> <metric_path> [n]"
  exit 1
fi

DIR="./$TYPE"

if [[ ! -d "$DIR" ]]; then
  echo "Error: Directory $DIR not found."
  exit 1
fi

# Find the N most recent files in the directory
FILES=$(ls -1 "$DIR"/"$TYPE"-*.json 2>/dev/null | sort -r | head -n "$N")

if [[ -z "$FILES" ]]; then
  echo "No files found for type $TYPE."
  exit 0
fi

for FILE in $FILES; do
  VALUE=$(jq -r "$METRIC" "$FILE")
  DATE=$(basename "$FILE" | sed "s/$TYPE-\(.*\).json/\1/")
  echo "$DATE: $VALUE"
done
