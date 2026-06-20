# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue for vulnerabilities.

- Use GitHub's [private vulnerability reporting](https://github.com/vedanta/terragon/security/advisories/new), or
- Email **barooah.vedanta@gmail.com** with details and reproduction steps.

You'll get an acknowledgement as soon as possible, and we'll work with you on a fix and coordinated disclosure.

## Scope — areas of particular interest

Terragon handles GitHub credentials and acts on a user's behalf, so the sensitive surfaces are:

- **Authentication** — the GitHub OAuth flow and session handling (Auth.js).
- **Token storage** — GitHub access tokens are encrypted at rest (AES-256-GCM) and only ever used server-side; reports of token exposure or decryption weaknesses are high priority.
- **Server actions / API** — the issue write paths (`moveIssue`, batch grooming, drawer edits) and access control on the current repository.
- **Route protection** — the `proxy.ts` gate on authenticated routes.

## Supported versions

Terragon is pre-1.0; security fixes target the latest `main`.
