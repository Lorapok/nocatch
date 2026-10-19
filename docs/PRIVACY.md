# Privacy Policy for NoCatch

**Last Updated:** October 19, 2026  
**Effective Date:** October 19, 2026  
**Published by:** Lorapok Labs ([https://lorapok.tech](https://lorapok.tech))  
**Contact:** [privacy@lorapok.tech](mailto:privacy@lorapok.tech) | [security@lorapok.tech](mailto:security@lorapok.tech)

---

## 1. Introduction

Lorapok Labs operates **NoCatch** ([https://nocatch.lorapok.tech](https://nocatch.lorapok.tech)), the NoCatch Discord Application, the NoCatch Browser Extension, and the `@lorapok/nocatch-core` command-line utility. 

We take your privacy seriously. This Privacy Policy explains our Zero-Trust, Zero-Retention approach to data handling.

---

## 2. Information We Do NOT Collect

- **No Media Content Storage**: We do **not** store, mirror, index, or archive any podcasts, audio files, video streams, or markdown notes downloaded through NoCatch. All media streams pipe directly between Google's content distribution networks and your client device.
- **No Personal Google Data**: We do **not** log, track, or save your Google account credentials, passwords, or personal files.
- **No IP Address or Tracking Logs**: We do not sell, rent, or monetize your IP address or browser telemetry.
- **No Discord User Data**: The NoCatch Discord bot does **not** store user message history, personal chat logs, or user credentials.

---

## 3. Information Handled Ephemerally

- **Notebook URLs**: When you provide a Google NotebookLM URL or artifact UUID to the web interface, API, or Discord bot, it is processed in temporary volatile memory solely to resolve the underlying Google CDN streaming link. It is discarded immediately after the response is returned.
- **Google Session Cookies (Optional)**: If you provide an optional session cookie to harvest a private notebook owned by your account, that cookie is held strictly in volatile RAM for the duration of the RPC handshake and never persisted to disk or databases.
- **Client-Side ZIP Generation**: When you click "Download All (ZIP)", the entire archive packaging process is performed **client-side inside your browser engine using JSZip**. No files are uploaded to our servers for bundling.

---

## 4. Discord Bot Data Handling

The NoCatch Discord Application operates under strict compliance with Discord's Developer Terms of Service and Developer Policy:
- **Intents**: The bot only processes messages containing explicit commands (`/nocatch audio`, `/nocatch video`, `/nocatch all`) or messages containing `notebook.google.com` links.
- **Data Retention**: No message content or user IDs are retained in databases.
- **Permissions**: The bot requests minimal necessary permissions: `Send Messages`, `Embed Links`, `Attach Files`, and `Use Slash Commands`.

---

## 5. Third-Party Services

NoCatch communicates with:
- **Google Cloud / Google NotebookLM CDN**: To resolve and fetch requested media streams.
- **Cloudflare Pages**: For static web application delivery, protected by Cloudflare Zero-Trust infrastructure.
- **Discord API**: For delivering slash commands and player embeds within Discord guilds and direct messages.

---

## 6. Children's Privacy

NoCatch does not knowingly collect or solicit personal information from anyone under the age of 13.

---

## 7. Changes to this Policy

We may update this Privacy Policy from time to time. Any changes will be published directly at [https://nocatch.lorapok.tech/privacy](https://nocatch.lorapok.tech/privacy) and documented in the GitHub repository.

---

## 8. Contact Us

If you have questions regarding this Privacy Policy, please reach out:
- **Email**: [privacy@lorapok.tech](mailto:privacy@lorapok.tech)
- **Web**: [https://lorapok.tech](https://lorapok.tech)
- **GitHub**: [https://github.com/Lorapok/nocatch](https://github.com/Lorapok/nocatch)
