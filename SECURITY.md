# Security Policy

## Reporting a vulnerability

If you find a security issue in CloudForge, **please do not open a public issue or PR**. Report it privately so we can investigate and release a fix before disclosure.

**Preferred channel:** GitHub's private vulnerability reporting

1. Go to https://github.com/MohamedGouda99/CloudForge/security/advisories/new
2. Fill in the advisory form with:
   - A clear description of the issue and its impact
   - Steps to reproduce (ideally a minimal PoC)
   - Affected version/commit
   - Any suggested mitigation

**Backup channel:** email the repo owner directly via the GitHub profile.

## What to expect

- Acknowledgement within **72 hours**.
- An initial assessment and triage within **7 days**.
- For valid issues, a fix plan, fix, and a coordinated disclosure timeline (usually 30–90 days depending on severity).

## Scope

In scope:
- Authentication bypass, token/session handling flaws (`backend/app/core/security.py`, `backend/app/api/endpoints/auth.py`)
- Authorization issues (users accessing projects/resources they shouldn't)
- SQL injection, command injection — especially in the Terraform generator pipeline where user input flows into shell commands
- SSRF via the AI assistant or drift-detection endpoints
- Supply-chain issues in our `requirements.txt` or `package.json`
- Secrets accidentally committed to the repo

Out of scope:
- Default admin credentials (`admin`/`admin123`) — these are intentional for local dev and **must** be changed before any internet-facing deployment. This is documented in the README.
- Issues in self-hosted dependencies (Postgres, Redis, LocalStack) unless CloudForge's configuration of them is at fault.
- Rate limiting bypass on localhost.

## Safe-harbor

We won't pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption
- Only interact with accounts they own or have explicit permission to test
- Report the issue privately and give us reasonable time to fix before public disclosure
