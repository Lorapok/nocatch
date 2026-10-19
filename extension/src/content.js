/**
 * NoCatch Browser Extension — Content Script for Social Medias & Google Notebook
 * Lorapok Labs • https://nocatch.lorapok.tech
 */

const NOTEBOOK_REGEX = /https?:\/\/(?:notebook|notebooklm)\.google\.com\/notebook\/([0-9a-fA-F-]+)(?:\/artifact\/([0-9a-fA-F-]+))?/;

// Check if currently on Google NotebookLM
const isNotebookLm = window.location.hostname.includes('notebook.google.com') || window.location.hostname.includes('notebooklm.google.com');

if (isNotebookLm) {
  initNotebookLMBar();
} else {
  initSocialMediaSentinel();
}

/**
 * Injects a direct "⚡ Download with NoCatch" action inside Google NotebookLM
 */
function initNotebookLMBar() {
  const checkInterval = setInterval(() => {
    // Check if artifact page
    const match = window.location.href.match(NOTEBOOK_REGEX);
    if (!match || !match[2]) return;

    if (document.getElementById('nocatch-header-action')) return;

    // Look for top bar actions or header
    const header = document.querySelector('header') || document.querySelector('[role="banner"]') || document.querySelector('article');
    if (header) {
      const btn = document.createElement('button');
      btn.id = 'nocatch-header-action';
      btn.className = 'nocatch-header-btn';
      btn.innerHTML = `<span>⚡</span><span>NoCatch: Download Audio</span>`;
      btn.title = 'Download Audio Overview (M4A) via NoCatch by Lorapok Labs';

      btn.addEventListener('click', () => {
        openQuickModal(window.location.href);
      });

      header.prepend(btn);
    }
  }, 1500);
}

/**
 * Scans Social Medias (Discord, X, Reddit, LinkedIn, Slack) for NotebookLM links
 */
function initSocialMediaSentinel() {
  const processedLinks = new WeakSet();

  function scanLinks() {
    const links = document.querySelectorAll('a[href*="notebook.google.com"], a[href*="notebooklm.google.com"]');
    links.forEach((a) => {
      if (processedLinks.has(a)) return;
      processedLinks.add(a);

      const match = a.href.match(NOTEBOOK_REGEX);
      if (!match) return;

      const badge = document.createElement('button');
      badge.className = 'nocatch-inject-btn';
      badge.innerHTML = `<span>⚡ NoCatch</span>`;
      badge.title = 'Download podcast audio or notes with Lorapok NoCatch';

      badge.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openQuickModal(a.href);
      });

      a.insertAdjacentElement('afterend', badge);
    });
  }

  scanLinks();
  const observer = new MutationObserver(() => scanLinks());
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Open Quick Download Modal
 */
async function openQuickModal(notebookUrl) {
  const existing = document.getElementById('nocatch-modal-container');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nocatch-modal-container';
  overlay.className = 'nocatch-overlay';

  overlay.innerHTML = `
    <div class="nocatch-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">⚡</span>
          <div>
            <div style="font-weight:800;font-size:16px;letter-spacing:-0.02em;">NoCatch Harvester</div>
            <div style="font-size:11px;color:#94a3b8;">Lorapok Labs Official Addon</div>
          </div>
        </div>
        <button id="nocatch-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;">✕</button>
      </div>

      <div id="nocatch-status-area" style="background:#030712;border:1px solid #1e293b;border-radius:12px;padding:16px;text-align:center;font-size:13px;color:#cbd5e1;margin-bottom:16px;">
        <div style="color:#00F3FF;margin-bottom:6px;font-weight:600;">Resolving Google NotebookLM Artifact...</div>
        <div style="font-size:11px;color:#64748b;font-family:monospace;">Querying v9rmvd batchExecute RPC...</div>
      </div>

      <div id="nocatch-actions" style="display:none;flex-direction:column;gap:8px;">
        <button id="nocatch-dl-audio" style="background:#39FF14;color:#000;border:none;border-radius:10px;padding:12px;font-weight:700;font-size:13px;cursor:pointer;">
          ⚡ Download Audio (M4A)
        </button>
        <button id="nocatch-dl-bundle" style="background:#1e293b;color:#fff;border:1px solid #334155;border-radius:10px;padding:10px;font-weight:600;font-size:12px;cursor:pointer;">
          📦 Download All Generated Things (ZIP)
        </button>
        <a id="nocatch-open-web" target="_blank" style="text-align:center;color:#00F3FF;font-size:12px;text-decoration:none;padding-top:4px;">
          Open in NoCatch Web Player →
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('nocatch-close-btn').onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  // Perform extraction via NoCatch Web API or direct RPC
  try {
    const res = await fetch('https://nocatch.lorapok.tech/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: notebookUrl }),
    }).catch(() => {
      // Fallback to local server if deployed locally
      return fetch('http://localhost:3890/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: notebookUrl }),
      });
    });

    const json = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'Failed to extract');

    const data = json.data;
    const statusArea = document.getElementById('nocatch-status-area');
    const actionsArea = document.getElementById('nocatch-actions');

    statusArea.innerHTML = `
      <div style="text-align:left;">
        <div style="font-weight:700;color:#ffffff;font-size:14px;margin-bottom:4px;">${data.title}</div>
        <div style="font-size:12px;color:#39FF14;">${data.audio ? `🎙 ${data.audio.episodeName} • ${data.audio.durationFormatted}` : '📄 Document'}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Based on ${data.sourceCount} verified sources</div>
      </div>
    `;

    actionsArea.style.display = 'flex';

    if (data.audio) {
      document.getElementById('nocatch-dl-audio').onclick = () => {
        window.open(data.audio.directDownloadUrl || data.audio.primaryStreamUrl, '_blank');
      };
    } else {
      document.getElementById('nocatch-dl-audio').style.display = 'none';
    }

    document.getElementById('nocatch-dl-bundle').onclick = () => {
      window.open(`https://nocatch.lorapok.tech/api/bundle?url=${encodeURIComponent(data.canonicalUrl)}`, '_blank');
    };

    document.getElementById('nocatch-open-web').href = `https://nocatch.lorapok.tech/?url=${encodeURIComponent(data.canonicalUrl)}`;
  } catch (err) {
    const statusArea = document.getElementById('nocatch-status-area');
    if (statusArea) {
      statusArea.innerHTML = `
        <div style="color:#f43f5e;font-weight:600;">Extraction Error</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${err.message}</div>
        <div style="margin-top:8px;">
          <a href="https://nocatch.lorapok.tech/?url=${encodeURIComponent(notebookUrl)}" target="_blank" style="color:#00F3FF;font-size:12px;">Open in NoCatch Web →</a>
        </div>
      `;
    }
  }
}
