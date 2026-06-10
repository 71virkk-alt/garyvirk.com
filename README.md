# garyvirk.com

Personal technical portfolio for Gary Virk, hosted with GitHub Pages.

Live site: https://garyvirk.com

## Purpose

This site is a static portfolio for practical IT support, network infrastructure, troubleshooting, cybersecurity learning, scripting experiments, and technical project writeups.

The public site should stay concise and proof-oriented. It should show useful technical work without exposing private personal details, employer-specific information, screenshots with private data, or sensitive operational context.

## Current Structure

- `index.html` - single-file homepage with inline CSS.
- `assets/` - public optimized images and other safe public assets.
- `CNAME` - custom domain binding for GitHub Pages. Do not delete.
- `deploy.sh` - one-command deploy helper.
- `_reference/` - private local planning/reference material, gitignored.
- `AGENTS.md` - private local operating notes, gitignored.

## Hosting And HTTPS

- Host: GitHub Pages
- Source: `main` branch, repository root
- Custom domain: `garyvirk.com`
- HTTPS: enforced through GitHub Pages

Expected checks:

```bash
curl -I https://garyvirk.com
curl -I http://garyvirk.com
curl -I https://www.garyvirk.com
```

Expected behavior:

- `https://garyvirk.com` returns `200`.
- `http://garyvirk.com` redirects to `https://garyvirk.com/`.
- `https://www.garyvirk.com` redirects to `https://garyvirk.com/`.

## Deploy

From the repository root:

```bash
./deploy.sh "Update homepage"
```

The script pulls with rebase, stages changes, commits, and pushes to `main`.

If Git authentication fails, run:

```bash
gh auth login
gh auth setup-git
```

Then retry the deploy or push.

## Content Direction

Near-term public content should prioritize:

- Windows Server support lab
- Packet Tracer small-office network lab
- Wireshark troubleshooting notes
- PowerShell endpoint inventory script
- Sanitized support-ticket writeups

Longer-term content can expand into:

- Cybersecurity fundamentals and defensive controls
- Endpoint management and deployment workflows
- Scripting and diagnostic utilities
- Small tools and diagnostics
- Technical articles and case studies

## Public Content Rules

Do not publish:

- Private screenshots
- Private identifiers
- Phone numbers or personal contact details
- Exact address or unnecessary location details
- Sensitive personal context
- Employer-private details
- Internal notes from `_reference/`

Use sanitized diagrams, synthetic lab data, and clean screenshots.
