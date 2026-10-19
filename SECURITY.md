# Security Policy

## Supported Versions

Lorapok Labs actively supports and provides security patches for the following versions of NoCatch:

| Version | Supported          | Security Status |
| ------- | ------------------ | --------------- |
| 2.x.x   | :white_check_mark: | Actively supported (Current) |
| 1.x.x   | :white_check_mark: | Critical security patches only |
| < 1.0   | :x:                | End of life |

---

## Zero-Trust Architecture Guarantee

**NoCatch** is engineered with a strict **Zero-Trust, Zero-Retention** philosophy:
1. **No User Content Retention**: Audio streams, video tracks, and note outlines are piped directly between Google CDN endpoints and the end-user's client. No audio, video, or note content is logged, persisted, or stored on Lorapok servers.
2. **Ephemeral Cookie Processing**: When optional Google session cookies are passed to access private notebooks, they are kept strictly in transient memory for the duration of the RPC handshake and immediately discarded.
3. **In-Browser Bundling**: The JSZip packaging engine runs 100% inside the client browser, completely eliminating server-side file accumulation.

---

## Reporting a Vulnerability

If you discover a security vulnerability in NoCatch or any related Lorapok service, please report it privately:

- **Email**: [security@lorapok.tech](mailto:security@lorapok.tech)
- **Subject**: `[SECURITY VULNERABILITY] NoCatch - <brief description>`
- **GPG Key**: Available upon request or via our security contact.

### What to include in your report:
- A detailed description of the vulnerability.
- Proof of concept (PoC) scripts or step-by-step reproduction instructions.
- Potential impact and affected components (Web, Core, Server, Discord Bot, Extension).
- Any proposed remediations.

### Our Response Timeline:
- **Acknowledgement**: Within 24 hours of report receipt.
- **Triage & Assessment**: Within 72 hours.
- **Fix & Disclosure**: Coordinated disclosure within 14 to 30 days depending on severity.

We request that you adhere to responsible disclosure and give our security team adequate time to resolve the issue before public announcement.
