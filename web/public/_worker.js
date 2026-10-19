var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/extract.js
var NOTEBOOK_REGEX = /https?:\/\/(?:notebook|notebooklm)\.google\.com\/notebook\/([0-9a-fA-F-]+)(?:\/artifact\/([0-9a-fA-F-]+))?/;
var UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
var KNOWN_NOTEBOOK_STUDIOS = {
  "8b88ac32-9785-489b-a224-9d95864fddca": "48e08424-d530-4d98-990c-a08dce8e015d"
};
function parseNotebookInput(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Input URL or ID string is required");
  }
  const trimmed = input.trim();
  const cleanInput = trimmed.split("?")[0].split("#")[0].trim();
  const match2 = cleanInput.match(NOTEBOOK_REGEX) || trimmed.match(NOTEBOOK_REGEX);
  if (match2) {
    const notebookId = match2[1];
    let artifactId = match2[2] || null;
    if (!artifactId) {
      try {
        const parsed = new URL(trimmed);
        artifactId = parsed.searchParams.get("artifact") || parsed.searchParams.get("artifactId") || null;
      } catch {
      }
    }
    if (!artifactId && KNOWN_NOTEBOOK_STUDIOS[notebookId]) {
      artifactId = KNOWN_NOTEBOOK_STUDIOS[notebookId];
    }
    return {
      notebookId,
      artifactId,
      rawUrl: match2[0]
    };
  }
  const uuidMatch = trimmed.match(UUID_REGEX);
  if (uuidMatch) {
    const uuid = uuidMatch[0];
    if (KNOWN_NOTEBOOK_STUDIOS[uuid]) {
      return {
        notebookId: uuid,
        artifactId: KNOWN_NOTEBOOK_STUDIOS[uuid],
        rawUrl: null
      };
    }
    return {
      notebookId: null,
      artifactId: uuid,
      rawUrl: null
    };
  }
  throw new Error(`Unable to recognize Google Notebook link or ID: "${input}"`);
}
__name(parseNotebookInput, "parseNotebookInput");
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor(sec % 3600 / 60);
  const secs = sec % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
__name(formatDuration, "formatDuration");
function sanitizeFilename(filename, fallback = "notebooklm_audio.m4a") {
  if (!filename) return fallback;
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_").slice(0, 150);
}
__name(sanitizeFilename, "sanitizeFilename");
async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { url, cookie } = body;
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'Missing "url" in request body' }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const { notebookId, artifactId } = parseNotebookInput(url);
    if (!artifactId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: notebookId ? `Notebook detected (${notebookId}). Google requires the direct Studio Artifact link or session cookie to harvest files. Open your Audio Overview in NotebookLM and paste the URL from your browser address bar (e.g. notebook.google.com/notebook/${notebookId}/artifact/<artifact_id>).` : "Artifact ID not detected. Please provide the artifact link: notebook.google.com/notebook/<nb_id>/artifact/<artifact_id>"
        }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }
    const rpcPayload = JSON.stringify([[["v9rmvd", JSON.stringify([artifactId]), null, "generic"]]]);
    const rpcUrl = `https://notebook.google.com/_/LabsTailwindUi/data/batchexecute?rpcids=v9rmvd&hl=en-US`;
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    };
    if (cookie) headers["Cookie"] = cookie;
    const rpcRes = await fetch(rpcUrl, {
      method: "POST",
      headers,
      body: new URLSearchParams({ "f.req": rpcPayload }).toString()
    });
    if (!rpcRes.ok) {
      throw new Error(`Google RPC returned HTTP ${rpcRes.status}`);
    }
    const text = await rpcRes.text();
    let parsedData = null;
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("[[") && line.includes("v9rmvd")) {
        try {
          const batch = JSON.parse(line);
          const innerStr = batch[0]?.[2];
          if (innerStr) {
            parsedData = JSON.parse(innerStr);
            break;
          }
        } catch {
        }
      }
    }
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error("Failed to parse artifact data from Google NotebookLM. The artifact may be private or deleted.");
    }
    const top = parsedData[0];
    const title = top[1] || "NotebookLM Audio Overview";
    const typeId = top[2];
    const sourcesCount = Array.isArray(top[3]) ? top[3].length : 0;
    const sourcesList = Array.isArray(top[3]) ? top[3].map((s) => Array.isArray(s) && s[0] ? s[0][0] : null).filter(Boolean) : [];
    const audioBlock = top[6];
    let audio = null;
    let video = null;
    if (audioBlock && Array.isArray(audioBlock)) {
      const episodeName = audioBlock[1]?.[0] || "Episode";
      const streamUrlM4a = audioBlock[3] || audioBlock[2];
      const streamUrlFallback = audioBlock[2];
      let durationSec = 0;
      if (Array.isArray(audioBlock[6])) {
        durationSec = audioBlock[6][0] + (audioBlock[6][1] || 0) / 1e9;
      }
      const streams = [];
      if (Array.isArray(audioBlock[5])) {
        for (const item of audioBlock[5]) {
          if (Array.isArray(item)) {
            streams.push({
              url: item[0],
              formatId: item[1],
              mimeType: item[2] || (item[0]?.includes("hls") ? "application/x-mpegURL" : "audio/mp4")
            });
          }
        }
      }
      let resolvedFilename = sanitizeFilename(`${title}.m4a`);
      let directDownloadUrl = streamUrlM4a;
      try {
        const headRes = await fetch(streamUrlM4a, {
          method: "HEAD",
          headers: { "User-Agent": headers["User-Agent"] },
          redirect: "manual"
        });
        const location = headRes.headers.get("location");
        if (location) {
          directDownloadUrl = location;
          const redirectedRes = await fetch(location, {
            method: "HEAD",
            headers: { "User-Agent": headers["User-Agent"] }
          });
          const cd = redirectedRes.headers.get("content-disposition");
          if (cd && cd.includes("filename=")) {
            const m = cd.match(/filename="?([^";]+)"?/);
            if (m && m[1]) resolvedFilename = m[1];
          }
        }
      } catch {
      }
      const dashStream = streams.find((s) => s.url && s.url.includes("dash"));
      if (dashStream) {
        try {
          const dashRes = await fetch(dashStream.url, { headers: { "User-Agent": headers["User-Agent"] } });
          if (dashRes.ok) {
            const dashXml = await dashRes.text();
            const videoMatch = dashXml.match(/<AdaptationSet[^>]*mimeType="video\/mp4"[^>]*>([\s\S]*?)<\/AdaptationSet>/);
            if (videoMatch) {
              const repMatches = [...videoMatch[1].matchAll(/<Representation[^>]*id="([^"]+)"[^>]*codecs="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>[\s\S]*?<BaseURL[^>]*>([\s\S]*?)<\/BaseURL>/g)];
              if (repMatches.length > 0) {
                const rep = repMatches[repMatches.length - 1];
                const videoUrl = rep[5].trim().replace(/&amp;/g, "&");
                video = {
                  formatId: rep[1],
                  codec: rep[2],
                  width: parseInt(rep[3], 10),
                  height: parseInt(rep[4], 10),
                  quality: `${rep[3]}x${rep[4]} H.264 (${rep[2]})`,
                  streamUrl: videoUrl,
                  filename: sanitizeFilename(`${title}_video.mp4`),
                  mimeType: "video/mp4",
                  type: "Google Video Canvas (avc1)"
                };
              }
            }
          }
        } catch (e) {
          console.warn("DASH video track extraction warning:", e);
        }
      }
      audio = {
        episodeName,
        durationSeconds: durationSec,
        durationFormatted: formatDuration(durationSec),
        primaryStreamUrl: streamUrlM4a,
        fallbackStreamUrl: streamUrlFallback,
        directDownloadUrl,
        filename: resolvedFilename,
        streams,
        quality: "Original 128kbps AAC (M4A)"
      };
    }
    let textContent = null;
    if (typeof top[5] === "string") {
      textContent = top[5];
    } else if (Array.isArray(top[5])) {
      textContent = JSON.stringify(top[5]);
    }
    const output = {
      artifactId,
      notebookId,
      title,
      type: typeId === 1 ? "audio_overview" : "document",
      typeId,
      sourceCount: sourcesCount,
      sourceIds: sourcesList,
      audio,
      video,
      textContent,
      canonicalUrl: `https://notebook.google.com/notebook/${notebookId || ""}/artifact/${artifactId}`,
      extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
      provider: "NoCatch by Lorapok Labs (Edge)"
    };
    return new Response(JSON.stringify({ success: true, data: output }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");

// api/health.js
async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: "online",
      product: "NoCatch by Lorapok Labs",
      service: "Google NotebookLM Harvester Edge API",
      version: "1.0.0",
      runtime: "Cloudflare Pages Functions",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
__name(onRequestGet, "onRequestGet");

// api/stream.js
async function onRequestGet2({ request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get("url");
  if (!targetUrl) {
    return new Response("Missing target URL parameter", { status: 400 });
  }
  try {
    const rawRange = request.headers.get("range");
    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    };
    if (rawRange) {
      const match2 = rawRange.trim().match(/^bytes=(\d+)-$/);
      if (match2) {
        const start = parseInt(match2[1], 10);
        fetchHeaders["Range"] = `bytes=${start}-${start + 5e7}`;
      } else {
        fetchHeaders["Range"] = rawRange.trim();
      }
    }
    let streamRes = await fetch(targetUrl, {
      method: request.method === "HEAD" ? "HEAD" : "GET",
      headers: fetchHeaders
    });
    if (!streamRes.ok && fetchHeaders["Range"]) {
      delete fetchHeaders["Range"];
      streamRes = await fetch(targetUrl, {
        method: request.method === "HEAD" ? "HEAD" : "GET",
        headers: fetchHeaders
      });
    }
    const responseHeaders = new Headers();
    const originContentType = streamRes.headers.get("content-type");
    const isVideo = targetUrl.includes("mime=video") || originContentType && originContentType.includes("video");
    responseHeaders.set("Content-Type", isVideo ? "video/mp4" : "audio/mp4");
    responseHeaders.set("Content-Disposition", "inline");
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=86400");
    const contentRange = streamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }
    const contentLength = streamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }
    return new Response(request.method === "HEAD" ? null : streamRes.body, {
      status: streamRes.status,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response(`Streaming Error: ${err.message}`, { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet");
async function onRequestHead(context) {
  return onRequestGet2(context);
}
__name(onRequestHead, "onRequestHead");
async function onRequestOptions2() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions");

// api/download.js
async function onRequest({ request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get("url");
  const filename = urlObj.searchParams.get("filename") || "notebooklm_file";
  if (!targetUrl) {
    return new Response("Missing target URL", { status: 400 });
  }
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type"
      }
    });
  }
  try {
    const rawRange = request.headers.get("range");
    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    };
    if (rawRange) {
      const match2 = rawRange.trim().match(/^bytes=(\d+)-$/);
      if (match2) {
        const start = parseInt(match2[1], 10);
        fetchHeaders["Range"] = `bytes=${start}-${start + 5e7}`;
      } else {
        fetchHeaders["Range"] = rawRange.trim();
      }
    }
    let streamRes = await fetch(targetUrl, {
      method: request.method === "HEAD" ? "HEAD" : "GET",
      headers: fetchHeaders
    });
    if (!streamRes.ok && fetchHeaders["Range"]) {
      delete fetchHeaders["Range"];
      streamRes = await fetch(targetUrl, {
        method: request.method === "HEAD" ? "HEAD" : "GET",
        headers: fetchHeaders
      });
    }
    if (!streamRes.ok) {
      return new Response(`Failed to fetch source: ${streamRes.statusText}`, { status: streamRes.status });
    }
    const headers = new Headers();
    const isVideo = filename.endsWith(".mp4") || targetUrl.includes("mime=video");
    const isAudio = filename.endsWith(".m4a") || targetUrl.includes("mime=audio");
    const defaultMime = isVideo ? "video/mp4" : isAudio ? "audio/mp4" : "application/octet-stream";
    headers.set("Content-Type", streamRes.headers.get("content-type") || defaultMime);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Accept-Ranges", "bytes");
    const contentRange = streamRes.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    const contentLength = streamRes.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    return new Response(request.method === "HEAD" ? null : streamRes.body, {
      status: streamRes.status,
      headers
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
__name(onRequest, "onRequest");

// ../.wrangler/tmp/pages-87GCPr/functionsRoutes-0.13188212856275883.mjs
var routes = [
  {
    routePath: "/api/extract",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/extract",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/health",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/stream",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/stream",
    mountPath: "/api",
    method: "HEAD",
    middlewares: [],
    modules: [onRequestHead]
  },
  {
    routePath: "/api/stream",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/download",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// ../../../../../../../home/maizied/.nvm/versions/node/v24.18.0/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../../../home/maizied/.nvm/versions/node/v24.18.0/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
