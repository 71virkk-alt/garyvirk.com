#!/bin/bash
# deploy.sh — one-command deploy to garyvirk.com
# Usage: ./deploy.sh ["commit message"]
# Any AI tool or human can run this after adding/editing files.
set -e
cd "$(dirname "$0")"
MSG="${1:-Deploy: $(date '+%Y-%m-%d %H:%M:%S')}"
git pull --rebase origin main
git add -A
git diff --cached --quiet && { echo "Nothing to deploy."; exit 0; }
git commit -m "$MSG"
git push origin main
echo "✅ Pushed. Live at https://garyvirk.com in ~1 minute."
