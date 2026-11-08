# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | ✅ |
| < 1.0 | ❌ |

DrawBlock is a local-first PWA. It has no backend, no accounts, and no server-side
storage. Security work focuses on the browser app, file handling, and the
dependency supply chain.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Use GitHub's private vulnerability reporting:

👉 https://github.com/rivaldoismir/drawblock/security/advisories/new

Include as much detail as you can:

- Affected version or commit.
- Browser and OS (Chrome/Edge version).
- Steps to reproduce, proof of concept, or a minimal workspace.
- Impact: what an attacker could read, write, or execute.
- Whether the issue requires a malicious file, a malicious link, or user
  interaction.

You can expect an acknowledgement within 7 days and a status update within 14
days. Please give us a reasonable window to fix the issue before public
disclosure. We will credit reporters in the advisory unless you prefer to remain
anonymous.

## Scope

In scope:

- Path traversal or workspace escape through file names, links, moves, or the
  File System Access API integration.
- Markdown/HTML injection that leads to script execution or data exfiltration.
- Silent overwrite or data loss caused by the save queue or conflict detection.
- Service worker / PWA cache poisoning or stale-asset issues.
- Privacy leaks: note contents or file names leaving the device.
- Vulnerable dependencies that are shipped to the browser.

Out of scope:

- Issues in Chrome, Edge, Vercel, or GitHub infrastructure.
- Vulnerabilities in upstream Excalidraw or BlockNote that do not affect
  DrawBlock's integration. Please report those upstream first.
- Social engineering, physical access, or a compromised operating system.
- Denial of service that requires the user to open a deliberately malicious
  local file in their own workspace (still interesting — report it, but it is
  lower priority).

## Privacy and analytics

DrawBlock never uploads note contents or file names. The hosted demo at
https://drawblock.vercel.app uses Vercel Web Analytics for aggregate page views
(no cookies, no cross-site tracking). The script is same-origin and only runs on
the production host; offline sessions make no request. See
[`docs/ANALYTICS.md`](docs/ANALYTICS.md) for details and how to disable it.

## Dependency advisories

`npm audit` is part of the release checklist. At the time of the v1.0.0 release,
all high and critical advisories are resolved. Four **low**-severity advisories
remain in the build-only `vite-plugin-pwa` → `workbox-build` → `deepmerge` chain;
`deepmerge` has no patched release for the reported prototype-poisoning issue,
and the affected code is not shipped to the browser. This is re-checked on every
release and by Dependabot.

## Safe harbor

We will not pursue legal action against researchers who:

- Act in good faith and avoid privacy violations, data destruction, or service
  disruption.
- Only test against their own workspace and data.
- Report findings privately and give us time to respond before disclosure.
