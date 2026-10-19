document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const extractBtn = document.getElementById('extract-btn');
  const currentTabBtn = document.getElementById('current-tab-btn');
  const resultBox = document.getElementById('result-box');
  const resTitle = document.getElementById('res-title');
  const resAudio = document.getElementById('res-audio');
  const dlAudioBtn = document.getElementById('dl-audio-btn');
  const status = document.getElementById('status');

  let activeData = null;

  // Auto-detect if current tab is NotebookLM
  currentTabBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url && (tab.url.includes('notebook.google.com') || tab.url.includes('notebooklm.google.com'))) {
        urlInput.value = tab.url;
        status.textContent = 'Detected Google Notebook tab!';
      } else {
        status.textContent = 'Current tab is not Google Notebook.';
      }
    } catch (e) {
      status.textContent = 'Tab detection unavailable.';
    }
  });

  extractBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      status.textContent = 'Please enter a valid NotebookLM URL.';
      return;
    }

    status.textContent = '⚡ Extracting from Google Notebook...';
    extractBtn.disabled = true;

    try {
      const res = await fetch('https://nocatch.lorapok.tech/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).catch(() => {
        return fetch('http://localhost:3890/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to extract');

      activeData = json.data;
      resTitle.textContent = activeData.title;
      if (activeData.audio) {
        resAudio.textContent = `🎙 ${activeData.audio.episodeName} (${activeData.audio.durationFormatted})`;
        dlAudioBtn.style.display = 'block';
      } else {
        resAudio.textContent = '📄 Text Document';
        dlAudioBtn.style.display = 'none';
      }

      resultBox.style.display = 'block';
      status.textContent = '✔ Extraction complete!';
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
    } finally {
      extractBtn.disabled = false;
    }
  });

  dlAudioBtn.addEventListener('click', () => {
    if (activeData?.audio) {
      const downloadUrl = activeData.audio.directDownloadUrl || activeData.audio.primaryStreamUrl;
      chrome.downloads.download({
        url: downloadUrl,
        filename: activeData.audio.filename || 'notebooklm_audio.m4a',
      });
    }
  });
});
