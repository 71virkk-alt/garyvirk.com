# garyvirk.com

Personal technical portfolio for Gary Virk, hosted at
[garyvirk.com](https://garyvirk.com) with GitHub Pages.

## Architecture

The authored source is a static Astro site with typed content, native CSS, and
small TypeScript interactions. Essential content is rendered as HTML and
remains available without JavaScript.

- `_site-src/`: pages, components, styles, scripts, and typed portfolio data
- `_site-public/`: root-level static files copied into the build
- `assets/`: portrait and social-preview assets
- `scripts/`: build validation and allowlisted root publishing
- `.site-dist/`: temporary local build, ignored by Git
- `index.html`, `resume.html`, `work.html`, and `work/`: generated Pages output
- `CNAME`: custom-domain binding; keep unchanged

The homepage uses the supplied black-and-white portrait, a standard scrolling
layout, a restrained pointer-responsive portrait, and a copy-email interaction.
Project pages distinguish controlled
Windows execution, network modeling, simulator checks, packet labs, review
status, and publication status.

Project repositories remain private. The website contains only selected,
sanitized evidence excerpts that are appropriate for public review.

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
pulls current changes, installs locked dependencies, builds and validates the
site, copies only approved generated files into the root, stages an explicit
allowlist, commits, and pushes:

```bash
./deploy.sh "Refine portfolio content and structure"
```

The script refuses to deploy from a branch other than `main`.

## Public content rules

Use synthetic lab data, sanitized diagrams, selected command output, and clear
scope boundaries. Do not publish private screenshots, identifiers, phone
numbers, home addresses, employer records, credentials, internal reference
files, or unfinished work described as complete.
