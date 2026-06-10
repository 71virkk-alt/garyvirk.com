# garyvirk.com

Static site deployed via **GitHub Pages** from `71virkk-alt/garyvirk.com` (branch `main`, root).

## Deploy (one command)

```bash
./deploy.sh "optional commit message"
```

That's it. Add/edit any HTML, CSS, JS, or image files in this folder, run the script, and changes are live at https://garyvirk.com within ~1 minute.

## Notes for AI tools (Cowork, Codex, etc.)

- This folder root = website root. `index.html` is the homepage.
- Put images in `assets/` (create as needed) and reference them with relative paths.
- `CNAME` must stay in the root — it binds the custom domain. Do not delete.
- `_reference/` is gitignored (private screenshots) — never publish it.
- Deploy = `./deploy.sh` (or `git add -A && git commit -m "msg" && git push origin main`).
