# garyvirk.com

Personal technical portfolio for Gary Virk, hosted at
[garyvirk.com](https://garyvirk.com) with GitHub Pages.

## Architecture

The authored source is an Astro static site with TypeScript content validation,
native CSS, and one isolated React Three Fiber scene. Essential content is
rendered as HTML and remains available without JavaScript.

- `_site-src/` — pages, components, styles, content, and typed site data
- `_site-public/` — root-level static files copied into the build
- `assets/` — public portrait, résumé PDF, social image, and generated assets
- `scripts/` — build validation and allowlisted root publishing
- `.site-dist/` — temporary local build, ignored by Git
- `index.html`, `resume.html`, and `404.html` — generated GitHub Pages output
- `CNAME` — custom-domain binding; keep unchanged

Draft case studies are validated during the build but are not given public
routes. A project should be marked as published only when its evidence is
complete, sanitized, and safe to share.

## Local development

Node.js 22.12 or newer and pnpm are required.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Production checks:

```bash
pnpm build
pnpm validate
```

## Deployment

GitHub Pages serves the repository root from `main`. The deployment helper
pulls current changes, installs the locked dependencies, builds and validates
the site, copies only approved generated files into the root, stages an
explicit allowlist, commits, and pushes:

```bash
./deploy.sh "Update portfolio"
```

The script refuses to deploy from a non-`main` branch. GitHub Pages normally
publishes a successful push within about one minute.

## Public content rules

Use synthetic lab data, sanitized diagrams, and clean evidence. Do not publish
private screenshots, identifiers, phone numbers, home addresses,
employer-confidential material, credentials, internal reference files, or
unfinished work described as complete.
