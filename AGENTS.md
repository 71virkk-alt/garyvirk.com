# AGENTS.md — garyvirk.com

Context file for any AI tool (OpenAI Codex, ChatGPT, Claude/Cowork, Cursor, etc.) working in this folder. Read this before making changes.

## What this folder is

This folder is the **live website root** for **https://garyvirk.com**, owned by Gary (GitHub: `71virkk-alt`). Anything committed and pushed here is published to the public internet within ~1 minute. There is no staging environment.

## Configuration already in place (done June 10, 2026 — do not redo)

- **Git repo** initialized in this folder, branch `main`, remote `origin` = `https://github.com/71virkk-alt/garyvirk.com.git`
- **Hosting**: GitHub Pages, source = `main` branch, `/` (root) folder. No build step, no framework — plain static files served as-is.
- **Custom domain**: `garyvirk.com`, bound via the `CNAME` file in the root and configured in repo Settings → Pages. HTTPS enforced once GitHub's certificate finished provisioning.
- **DNS** (Spaceship, already set and verified working — do not change):
  - 4 × A records on `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - CNAME `www` → `71virkk-alt.github.io`
- **Verified end-to-end**: test `index.html` deployed and confirmed live at garyvirk.com.

## How to deploy

One command from the folder root:

```bash
./deploy.sh "short description of the change"
```

The script pulls (rebase), stages everything, commits, and pushes to `main`. GitHub Pages publishes automatically — live in ~1 minute. Equivalent manual sequence:

```bash
git pull --rebase origin main
git add -A
git commit -m "message"
git push origin main
```

If a push fails with an authentication error, stop and tell Gary to run `gh auth login` — never ask for or handle credentials yourself.

## File and design conventions

- `index.html` is the homepage. Currently a placeholder test page — it is expected to be replaced with the real site.
- **Single-file pages preferred**: inline CSS/JS in each HTML file unless the site grows enough to justify shared `css/` and `js/` folders.
- **Images and assets**: put them in `assets/` (create it if needed), reference with relative paths (`assets/photo.jpg`). Optimize images before committing (web-sized, not camera originals).
- Additional pages: create `about.html` etc. in the root, or `foldername/index.html` for clean URLs (`garyvirk.com/foldername/`).
- No server-side code — GitHub Pages is static only. No PHP, no databases, no Node server. Client-side JS and third-party APIs are fine.
- Keep it dependency-free where possible; CDN links are acceptable.

## Hard rules

- **Never delete or edit `CNAME`** — it binds the custom domain. Deleting it takes the site off garyvirk.com.
- **Never touch `_reference/`** and never remove it from `.gitignore` — it contains private screenshots that must not be published.
- Don't commit secrets, `.env` files, or personal data — this is a public repo and a public site.
- Don't change DNS, repo settings, or the Pages configuration — they are done and verified.
- Everything pushed is instantly public. If unsure whether something should be live, ask before deploying.
