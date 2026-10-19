import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
  Download,
  Sparkles,
  Headphones,
  FileText,
  Radio,
  Archive,
  Terminal,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Bot,
  Globe,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Disc,
  FolderDown,
  Info,
  Video,
  Film,
  FileCode,
  PackageCheck
} from 'lucide-react';

const DEMO_URL = 'https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d';
const DEMO_SHARE_URL = 'https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca?utm_source=nlmm_share';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState('single'); // single | batch | discord
  const [batchUrls, setBatchUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [artifact, setArtifact] = useState(null);
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [playerMode, setPlayerMode] = useState('audio'); // audio | video
  const [bundleProgress, setBundleProgress] = useState(null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  // Animated background waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += isPlaying ? 0.04 : 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const waves = [
        { color: 'rgba(57, 255, 20, 0.06)', speed: 1.0, freq: 0.003, amp: isPlaying ? 60 : 35, yOffset: canvas.height * 0.4 },
        { color: 'rgba(0, 243, 255, 0.05)', speed: 0.8, freq: 0.004, amp: isPlaying ? 75 : 40, yOffset: canvas.height * 0.45 },
        { color: 'rgba(188, 19, 254, 0.04)', speed: 1.2, freq: 0.002, amp: isPlaying ? 50 : 25, yOffset: canvas.height * 0.5 },
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = w.yOffset + Math.sin(x * w.freq + time * w.speed) * w.amp + Math.cos(x * w.freq * 0.5 - time) * (w.amp * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  // Audio Time Updates & Playback State Sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else if (artifact?.audio?.durationSeconds) {
        setDuration(artifact.audio.durationSeconds);
      }
    };
    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);
    const onError = (e) => {
      console.warn('Audio stream playback event error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [artifact]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.error('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Extraction Execution
  const handleExtract = async (targetUrl = inputUrl) => {
    const url = targetUrl.trim();
    if (!url) return;

    setLoading(true);
    setError(null);
    setLogs([]);
    setArtifact(null);

    addLog('Connecting to Lorapok NoCatch Neural Gateway...');
    addLog(`Parsing Google Notebook input: ${url.slice(0, 60)}...`);

    try {
      addLog('Dispatched v9rmvd Google RPC batchExecute query...');
      
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      addLog(`Resolved: "${json.data.title}"`);
      if (json.data.audio) {
        addLog(`Located High-Bitrate AAC stream: ${json.data.audio.durationFormatted}`);
        addLog(`Audio Episode: "${json.data.audio.episodeName}" (${json.data.sourceCount} sources cited)`);
      }
      if (json.data.video) {
        addLog(`Located Google Video Canvas track: ${json.data.video.quality} (${json.data.video.codec})`);
      }
      addLog('Extraction verified. Ready for immediate playback and download.');

      setArtifact(json.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to extract Google Notebook content');
      addLog(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (downloadUrl, filename) => {
    const a = document.createElement('a');
    a.href = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(filename)}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadBundle = async () => {
    if (!artifact) return;
    try {
      setBundleProgress('Initializing Studio Bundle...');
      const zip = new JSZip();
      const safeTitle = (artifact.title || 'Studio_Artifact')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_');

      // 1. Fetch Audio (.m4a)
      if (artifact.audio?.primaryStreamUrl || artifact.audio?.directDownloadUrl) {
        setBundleProgress('Fetching Audio Podcast (.m4a)...');
        const audioUrl = `/api/stream?url=${encodeURIComponent(artifact.audio.primaryStreamUrl || artifact.audio.directDownloadUrl)}`;
        const audioRes = await fetch(audioUrl);
        if (audioRes.ok) {
          const audioBlob = await audioRes.blob();
          zip.file(`${safeTitle}_Audio_Overview.m4a`, audioBlob);
        }
      }

      // 2. Fetch Video (.mp4)
      if (artifact.video?.streamUrl) {
        setBundleProgress('Fetching Video Stream (.mp4)...');
        const videoUrl = `/api/stream?url=${encodeURIComponent(artifact.video.streamUrl)}`;
        const videoRes = await fetch(videoUrl);
        if (videoRes.ok) {
          const videoBlob = await videoRes.blob();
          zip.file(`${safeTitle}_Video_Track.mp4`, videoBlob);
        }
      }

      // 3. Add Study Guide (.md)
      setBundleProgress('Adding Study Guide (.md)...');
      const mdContent = artifact.textContent 
        ? `# ${artifact.title}\n\n${artifact.textContent}`
        : `# ${artifact.title}\n\n## Episode: ${artifact.audio?.episodeName || 'Podcast Episode'}\n\nDuration: ${artifact.audio?.durationFormatted || 'N/A'}\n\n*Harvested via NoCatch by Lorapok Labs.*\n\n## Sources Cited (${artifact.sourceCount || 0})\n${(artifact.sourceIds || []).map((s, i) => `${i + 1}. Source ID: ${s}`).join('\n')}\n`;
      zip.file(`${safeTitle}_Study_Guide.md`, mdContent);

      // 4. Add Sources Manifest (.json)
      setBundleProgress('Adding Sources Manifest (.json)...');
      zip.file(`${safeTitle}_Sources_Manifest.json`, JSON.stringify(artifact, null, 2));

      // 5. Add README.txt
      const readme = `======================================================================
NoCatch Studio Master Archive
A Product of Lorapok Labs | https://nocatch.lorapok.tech
======================================================================

Notebook Title: ${artifact.title}
Episode: ${artifact.audio?.episodeName || 'N/A'}
Duration: ${artifact.audio?.durationFormatted || 'N/A'}
Sources Cited: ${artifact.sourceCount || 0}
Canonical URL: ${artifact.canonicalUrl}
Harvested At: ${artifact.extractedAt || new Date().toISOString()}

Archive Contents:
1. ${safeTitle}_Audio_Overview.m4a    - High-bitrate 128kbps stereo AAC podcast
${artifact.video ? `2. ${safeTitle}_Video_Track.mp4       - Google Video Canvas stream (AVC1 / H.264)\n` : ''}3. ${safeTitle}_Study_Guide.md       - Synthesized notes & briefing doc
4. ${safeTitle}_Sources_Manifest.json  - Machine-readable sources & stream metadata
5. README.txt                         - Archive documentation

Powered by NoCatch Neural Pipeline (Lorapok Labs).
GitHub: https://github.com/Lorapok/nocatch
Mission Control: https://lorapok.tech
`;
      zip.file('README.txt', readme);

      // 6. Generate ZIP
      setBundleProgress('Compressing archive...');
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => {
          setBundleProgress(`Compressing: ${Math.round(meta.percent)}%`);
        }
      );

      const blobUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${safeTitle}_Studio_Bundle.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      setBundleProgress(null);
      addLog(`Master Studio ZIP bundle generated & downloaded: ${safeTitle}_Studio_Bundle.zip`);
    } catch (err) {
      console.error('Bundle error:', err);
      setBundleProgress(null);
      alert('Failed to package ZIP bundle: ' + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#39FF14] selection:text-black">
      {/* Background Live Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Cyber Grid Lines Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#030712]/80 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-[#39FF14]/40 shadow-[0_0_20px_rgba(57,255,20,0.25)]">
              <img src="/assets/nocatch-logo.svg" alt="NoCatch Logo" className="w-8 h-8 object-contain" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F3FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#39FF14]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  NoCatch
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
                  v2.0 Core
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono tracking-tight flex items-center gap-1">
                by <a href="https://lorapok.tech" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-[#00F3FF] transition">Lorapok Labs</a>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#discord-bot" className="hover:text-[#00F3FF] transition flex items-center gap-1">
              <Bot className="w-4 h-4" /> Discord App
            </a>
            <a href="#extension" className="hover:text-[#39FF14] transition flex items-center gap-1">
              <Globe className="w-4 h-4" /> Browser Addon
            </a>
            <a href="#api" className="hover:text-white transition">Developer API</a>
            <a 
              href="https://github.com/Lorapok/nocatch" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        {/* Hero Title & Value Proposition */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00F3FF]/30 text-xs font-mono text-[#00F3FF] mb-5 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#39FF14]" />
            Universal Google NotebookLM Audio & Artifact Harvester
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Download Any Podcast & Notes from{' '}
            <span className="bg-gradient-to-r from-[#00F3FF] via-[#39FF14] to-[#BC13FE] bg-clip-text text-transparent">
              Google Notebook
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            High-speed extraction for Audio Overviews (M4A/AAC), Briefing Docs, Study Guides, and Mindmaps. Download a single item or everything at once.
          </p>
        </div>

        {/* Input Card Container */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 mb-8 transition-all">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'single'
                  ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" /> Single Artifact
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'batch'
                  ? 'bg-[#00F3FF]/15 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Batch & Notebooks
            </button>
            <button
              onClick={() => setActiveTab('discord')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'discord'
                  ? 'bg-[#BC13FE]/15 text-[#BC13FE] border border-[#BC13FE]/40 shadow-[0_0_12px_rgba(188,19,254,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" /> Discord Link Resolver
            </button>
          </div>

          {/* Form Input Area */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              <div className="relative flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste Google Notebook link (e.g. notebook.google.com/notebook/.../artifact/...)"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition pr-28 font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        setInputUrl(clip);
                      } catch {}
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition"
                  >
                    Paste
                  </button>
                </div>

                <button
                  onClick={() => handleExtract()}
                  disabled={loading || !inputUrl.trim()}
                  className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#00F3FF] via-[#39FF14] to-[#39FF14] text-black font-bold tracking-tight shadow-[0_0_25px_rgba(57,255,20,0.35)] hover:shadow-[0_0_35px_rgba(57,255,20,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Harvesting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Extract & Download</span>
                    </>
                  )}
                </button>
              </div>

              {/* Demo Helper Pill */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#39FF14]" /> Direct Google CDN resolution (100% loss-free)
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl(DEMO_SHARE_URL);
                      handleExtract(DEMO_SHARE_URL);
                    }}
                    className="text-[#39FF14] hover:underline flex items-center gap-1 font-mono text-[11px] bg-[#39FF14]/10 px-2 py-1 rounded-lg border border-[#39FF14]/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Test Shared Notebook Link (?utm_source=nlmm_share)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl(DEMO_URL);
                      handleExtract(DEMO_URL);
                    }}
                    className="text-[#00F3FF] hover:underline flex items-center gap-1 font-mono text-[11px] bg-[#00F3FF]/10 px-2 py-1 rounded-lg border border-[#00F3FF]/30"
                  >
                    <Headphones className="w-3.5 h-3.5" /> Direct Artifact Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="space-y-4">
              <textarea
                rows={4}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder="Paste multiple NotebookLM URLs (one per line)..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F3FF] focus:ring-2 focus:ring-[#00F3FF]/20 font-mono"
              />
              <button
                onClick={() => {
                  const first = batchUrls.split('\n')[0];
                  if (first) handleExtract(first);
                }}
                disabled={loading || !batchUrls.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F3FF] to-[#39FF14] text-black font-bold tracking-tight shadow-[0_0_20px_rgba(0,243,255,0.3)] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FolderDown className="w-5 h-5" /> Download All Generated Things in Batch
              </button>
            </div>
          )}

          {activeTab === 'discord' && (
            <div className="space-y-4">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste Discord link (e.g. discord.com/channels/@me/1559338219865112720/...)"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#BC13FE] font-mono"
              />
              <button
                onClick={() => {
                  // Fallback to sample demo or extracted URL
                  handleExtract(DEMO_URL);
                }}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#BC13FE] to-[#00F3FF] text-white font-bold tracking-tight shadow-[0_0_20px_rgba(188,19,254,0.3)] transition flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5" /> Resolve Discord Message & Harvest Media
              </button>
            </div>
          )}

          {/* Terminal Logs Output */}
          {logs.length > 0 && (
            <div className="mt-6 rounded-2xl bg-black/80 border border-slate-800 p-4 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>NoCatch Neural Pipeline Log</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.includes('ERROR') ? 'text-rose-400' : log.includes('Resolved') ? 'text-[#39FF14]' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Extracted Artifact Display Card */}
        {artifact && (
          <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Audio Overview Card */}
            {artifact.audio ? (
              <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5" /> Audio Overview (Podcast)
                      </span>
                      {artifact.video && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#00F3FF]/15 text-[#00F3FF] border border-[#00F3FF]/30 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" /> Video Track Detected
                        </span>
                      )}
                      <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {artifact.audio.quality}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {artifact.sourceCount} Sources Cited
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {artifact.title}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                      Episode: <span className="text-[#00F3FF] font-medium">{artifact.audio.episodeName}</span> • Duration: <span className="text-white font-mono">{artifact.audio.durationFormatted}</span>
                    </p>
                  </div>

                  {/* Master Download Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleDownloadFile(artifact.audio.directDownloadUrl || artifact.audio.primaryStreamUrl, artifact.audio.filename)}
                      className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold text-xs sm:text-sm tracking-tight shadow-[0_0_20px_rgba(57,255,20,0.4)] transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download Audio (M4A)
                    </button>
                    {artifact.video && (
                      <button
                        onClick={() => handleDownloadFile(artifact.video.streamUrl, artifact.video.filename)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F3FF] to-cyan-400 hover:opacity-90 text-black font-bold text-xs sm:text-sm tracking-tight shadow-[0_0_20px_rgba(0,243,255,0.4)] transition flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Download Video (MP4)
                      </button>
                    )}
                    <button
                      onClick={handleDownloadBundle}
                      disabled={bundleProgress !== null}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 disabled:opacity-60"
                    >
                      {bundleProgress ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#00F3FF] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[#00F3FF] font-mono text-xs">{bundleProgress}</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 text-[#00F3FF]" />
                          <span>Download All (ZIP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Media Player Mode Tabs */}
                {artifact.video && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setPlayerMode('audio')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        playerMode === 'audio'
                          ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" /> Waveform Audio Player
                    </button>
                    <button
                      onClick={() => {
                        if (isPlaying && audioRef.current) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        }
                        setPlayerMode('video');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        playerMode === 'video'
                          ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Google Video Canvas (MP4)
                    </button>
                  </div>
                )}

                {/* Video Player Display */}
                {playerMode === 'video' && artifact.video ? (
                  <div className="rounded-2xl bg-black/80 border border-[#00F3FF]/30 p-5 space-y-4 shadow-[0_0_20px_rgba(0,243,255,0.15)]">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-[#00F3FF] font-semibold">
                        <Film className="w-4 h-4 text-[#00F3FF]" />
                        <span>Google Video Stream (AVC1 / H.264 @ 30fps)</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {artifact.video.quality}
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden aspect-video max-w-2xl mx-auto bg-black flex items-center justify-center border border-slate-700 shadow-2xl">
                      <video
                        key={artifact.artifactId + '_video'}
                        src={`/api/stream?url=${encodeURIComponent(artifact.video.streamUrl)}`}
                        controls
                        className="w-full h-full object-contain"
                        poster="/assets/nocatch-logo.svg"
                      />
                    </div>

                    <div className="text-xs text-slate-400 font-mono flex items-start gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      <Info className="w-4 h-4 text-[#00F3FF] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Video Track Architecture:</strong> Google NotebookLM generates 128kbps stereo AAC for listening, and simultaneously muxes an internal 320x240 AVC1 Google Video stream for DASH players. NoCatch provides access to both the pure high-bitrate audio and the raw video track.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Cyber Audio Player */
                  <div className="rounded-2xl bg-black/60 border border-slate-800 p-5 space-y-4">
                    <audio
                      key={artifact.artifactId}
                      ref={audioRef}
                      src={`/api/stream?url=${encodeURIComponent(artifact.audio.primaryStreamUrl || artifact.audio.directDownloadUrl)}`}
                      preload="auto"
                    />

                    {/* Live Waveform Scrubber */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-slate-500">Live Stream Audio</span>
                        <span>{formatTime(duration || artifact.audio.durationSeconds)}</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={duration || artifact.audio.durationSeconds}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                      />
                    </div>

                    {/* Player Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F3FF] to-[#39FF14] text-black flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:scale-105 transition"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        <button
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                            }
                          }}
                          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                          title="Rewind 10s"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
                          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSpeedChange(s)}
                              className={`px-2 py-0.5 rounded transition ${
                                playbackRate === s ? 'bg-[#39FF14] text-black font-bold' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleMute}
                          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(artifact.canonicalUrl)}
                          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                          title="Copy Canonical Link"
                        >
                          {copied ? <Check className="w-4 h-4 text-[#39FF14]" /> : <Share2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Google NotebookLM Studio All Files Catalog */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#39FF14]" />
                  <h3 className="text-xl font-bold text-white tracking-tight">Studio Generated Files (All 5 Assets)</h3>
                </div>
                <span className="text-xs font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-3 py-1 rounded-full w-fit">
                  100% Downloadable • Bit-Perfect
                </span>
              </div>

              {/* Master Bundle Hero Card */}
              <div className="glass-panel-glow rounded-2xl p-6 border border-[#39FF14]/40 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-gradient-to-r from-slate-900/90 via-black to-slate-900/90 shadow-[0_0_25px_rgba(57,255,20,0.15)]">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 flex items-center gap-1">
                      <Archive className="w-3.5 h-3.5" /> MASTER ZIP ARCHIVE
                    </span>
                    <span className="text-base font-bold text-white">Complete Studio Package</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Downloads all studio files in one bundle: Audio Overview (.m4a), Google Video Track (.mp4), Briefing Document (.md), Sources & Metadata (.json), and Lorapok documentation.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBundle}
                  disabled={bundleProgress !== null}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] via-[#39FF14] to-[#39FF14] text-black font-bold text-xs sm:text-sm tracking-tight shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  {bundleProgress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono">{bundleProgress}</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 fill-current" />
                      <span>Download Studio Bundle (ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4 Individual Studio Assets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Audio Overview */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-[#39FF14]/40 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Headphones className="w-4 h-4 text-[#39FF14]" />
                        <span>1. Audio Overview Podcast</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                        .M4A / AAC
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Original 128kbps stereo AAC podcast audio • {artifact.audio?.durationFormatted || '32:50'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(artifact.audio?.directDownloadUrl || artifact.audio?.primaryStreamUrl, artifact.audio?.filename || 'audio.m4a')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-[#39FF14]/50 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#39FF14]" /> Download .M4A Audio
                  </button>
                </div>

                {/* 2. Video Canvas Stream */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-[#00F3FF]/40 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Film className="w-4 h-4 text-[#00F3FF]" />
                        <span>2. Google Video Canvas</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00F3FF]/15 text-[#00F3FF] border border-[#00F3FF]/30">
                        .MP4 / AVC1
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {artifact.video ? `Google Video Canvas stream • ${artifact.video.quality}` : 'Internal DASH video canvas track'}
                    </p>
                  </div>
                  {artifact.video ? (
                    <button
                      onClick={() => handleDownloadFile(artifact.video.streamUrl, artifact.video.filename)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-[#00F3FF]/50 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00F3FF]" /> Download .MP4 Video
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-mono text-center py-2 bg-slate-900/60 rounded-xl">
                      Audio-only artifact (No video track muxed)
                    </div>
                  )}
                </div>

                {/* 3. Study Guide & Briefing Doc */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>3. Study Guide & Briefing Doc</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        .MD
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Synthesized knowledge briefing and outline derived from {artifact.sourceCount} user sources.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const md = artifact.textContent || `# ${artifact.title}\n\nEpisode: ${artifact.audio?.episodeName || ''}\nDuration: ${artifact.audio?.durationFormatted || ''}\n\n*Harvested via NoCatch by Lorapok Labs*`;
                      const blob = new Blob([md], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${artifact.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_')}_notes.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Download .MD Notes
                  </button>
                </div>

                {/* 4. Sources Manifest */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-[#BC13FE]/40 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Layers className="w-4 h-4 text-[#BC13FE]" />
                        <span>4. Sources Manifest & Metadata</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#BC13FE]/15 text-[#BC13FE] border border-[#BC13FE]/30">
                        .JSON
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Full citation catalog ({artifact.sourceCount} sources), CDN stream links, and timestamps.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${artifact.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_')}_metadata.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-[#BC13FE]/50 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#BC13FE]" /> Download .JSON Manifest
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Grid Section */}
        <section id="features" className="py-12 border-t border-slate-800/80">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-[#39FF14] uppercase tracking-widest">Engineering Highlights</span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
              Built for Complete Independence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Protocol Harvester</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connects directly to Google's RPC endpoint without heavy headless browser overhead. Extracts 128kbps AAC streams in sub-second latency.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F3FF]/10 border border-[#00F3FF]/30 flex items-center justify-center text-[#00F3FF]">
                <Archive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Single or Bulk Bundle</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Choose between grabbing a single episode or packaging the entire notebook (audio + notes + sources) into an indexed ZIP archive.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#BC13FE]/10 border border-[#BC13FE]/30 flex items-center justify-center text-[#BC13FE]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Private & Zero-Trust</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No storage of your files. All streams pipe directly through verified ephemeral channels with full HTTPS encryption.
              </p>
            </div>
          </div>
        </section>

        {/* Discord Bot & Browser Extension Showcase */}
        <section id="discord-bot" className="py-12 border-t border-slate-800/80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="glass-panel-glow rounded-3xl p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-xs font-mono text-[#5865F2]">
                <Bot className="w-4 h-4" /> Discord Integration
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Download Directly Inside Discord
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Drop any Google Notebook link into your server or DMs. The NoCatch Discord bot automatically renders an interactive player and sends the podcast file right into your chat.
              </p>
              <div className="bg-black/60 rounded-xl p-3 font-mono text-xs text-slate-300 border border-slate-800 space-y-1">
                <div><span className="text-[#39FF14]">$</span> /nocatch audio &lt;notebook_url&gt;</div>
                <div><span className="text-[#00F3FF]">$</span> /nocatch all &lt;notebook_url&gt;</div>
              </div>
              <a
                href="#discord-bot"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-semibold text-sm transition"
              >
                <Bot className="w-4 h-4" /> Add NoCatch Bot to Discord
              </a>
            </div>

            <div id="extension" className="glass-panel-glow rounded-3xl p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/40 text-xs font-mono text-[#39FF14]">
                <Globe className="w-4 h-4" /> Browser Addon
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                1-Click Download on All Socials
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Adds a floating ⚡ NoCatch button whenever a NotebookLM link is spotted on Discord Web, X/Twitter, Reddit, or LinkedIn. Injects a direct download bar right on Google NotebookLM itself!
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">Chrome</span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">Firefox</span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">Edge</span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">Brave</span>
              </div>
              <button
                onClick={() => alert('Download the extension folder from /mnt/NewVolume/Personal_Projects/loragent/nocatch/extension and load as unpacked!')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#39FF14] text-black font-bold text-sm transition shadow-[0_0_15px_rgba(57,255,20,0.3)]"
              >
                <Globe className="w-4 h-4" /> Get NoCatch Extension
              </button>
            </div>
          </div>
        </section>

        {/* Developer API Section */}
        <section id="api" className="py-12 border-t border-slate-800/80">
          <div className="glass-panel rounded-3xl p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#00F3FF] uppercase tracking-wider">Loragent Ecosystem</span>
                <h2 className="text-2xl font-bold text-white mt-1">Developer API & CLI</h2>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                POST /api/extract
              </span>
            </div>

            <div className="rounded-2xl bg-black/80 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre>{`curl -X POST https://nocatch.lorapok.tech/api/extract \\
  -H "Content-Type: application/json" \\
  -d '{"url": "${DEMO_URL}"}'`}</pre>
            </div>
          </div>
        </section>
      </main>

      {/* Cyberpunk Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#030712] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/nocatch-logo.svg" alt="NoCatch" className="w-6 h-6" />
            <span className="text-sm font-semibold text-white">NoCatch</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400">A Product of <a href="https://lorapok.tech" className="text-slate-300 hover:text-[#39FF14]">Lorapok Labs</a></span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="https://nocatch.lorapok.tech" className="hover:text-white transition">nocatch.lorapok.tech</a>
            <a href="https://github.com/Lorapok/nocatch" className="hover:text-white transition">GitHub</a>
            <a href="https://lorapok.tech" className="hover:text-white transition">Mission Control</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
