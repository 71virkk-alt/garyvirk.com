#!/bin/bash
# Build, validate, and publish the allowlisted site files to GitHub Pages.
# Usage: ./deploy.sh ["short description of the change"]
set -euo pipefail

cd "$(dirname "$0")"
MESSAGE="${1:-Update portfolio}"
CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Deployment stopped: switch to main after the redesign has been reviewed."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Deployment stopped: pnpm is required to build and validate the site."
  exit 1
fi

git pull --rebase --autostash origin main
pnpm install --frozen-lockfile
pnpm release:prepare

git add -- \
  .gitattributes .gitignore .npmrc README.md astro.config.mjs deploy.sh package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json \
  _site-src _site-public scripts \
  .nojekyll CNAME LICENSE index.html resume.html 404.html robots.txt sitemap.xml favicon.svg site.webmanifest \
  assets/avatar.webp assets/Gary-Virk-Resume.pdf assets/og.jpg assets/og-source.svg assets/build

git diff --cached --quiet && { echo "Nothing to deploy."; exit 0; }
git commit -m "$MESSAGE"
git push origin main
echo "Pushed. GitHub Pages normally publishes at https://garyvirk.com within about one minute."
