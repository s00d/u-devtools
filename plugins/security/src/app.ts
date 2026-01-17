import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { SECRET_PATTERNS, SUSPICIOUS_ENV_KEYS } from './utils/regex';
import type { SecurityIssue, SecurityProtocol } from './types';
import { setupDevTools, useBridge } from './context';

// --- UTILITIES ---

/**
 * Gets list of global variables added by application,
 * comparing current window with clean iframe.
 */
function getCustomGlobals(): Record<string, any> {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Get "clean" keys (native browser APIs)
  // Use try-catch, as some browsers may block access
  let nativeKeys: Set<string>;
  try {
    const contentWindow = iframe.contentWindow;
    if (!contentWindow) throw new Error('No content window');
    nativeKeys = new Set(Object.getOwnPropertyNames(contentWindow));
  } catch (e) {
    // Fallback: if iframe blocked by CSP, use heuristic
    // (exclude most popular native properties)
    nativeKeys = new Set([
      'window',
      'self',
      'document',
      'location',
      'customElements',
      'history',
      'screen',
      'navigator',
      'localStorage',
      'sessionStorage',
      'fetch',
      'XMLHttpRequest',
      'console',
      'alert',
      'confirm',
      'prompt',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'atob',
      'btoa',
      'Blob',
      'File',
      'FileReader',
      'FormData',
      'URL',
      'URLSearchParams',
      'Headers',
      'Request',
      'Response',
      'Event',
      'CustomEvent',
      'MessageEvent',
      'Storage',
      'IndexedDB',
      'WebSocket',
      'Worker',
      'SharedWorker',
      'BroadcastChannel',
      'MutationObserver',
      'IntersectionObserver',
      'ResizeObserver',
      'PerformanceObserver',
      'MediaQueryList',
      'matchMedia',
      'getComputedStyle',
      'getSelection',
      'crypto',
      'Crypto',
      'SubtleCrypto',
      'TextEncoder',
      'TextDecoder',
      'AbortController',
      'AbortSignal',
      'ReadableStream',
      'WritableStream',
      'TransformStream',
      'CompressionStream',
      'DecompressionStream',
    ]);
  } finally {
    iframe.remove();
  }

  const currentKeys = Object.getOwnPropertyNames(window);
  const customGlobals: Record<string, any> = {};

  // Exclusion list (DevTools, browser extensions, webpack)
  const IGNORE_LIST = [
    '__UDEVTOOLS_CONFIG__', // Our own config
    '__U_DEVTOOLS', // Universal DevTools
    '__VUE_DEVTOOLS_GLOBAL_HOOK__',
    '__VUE_DEVTOOLS', // Vue DevTools
    '__PIXI_DEVTOOLS', // PixiJS DevTools
    '__REACT_DEVTOOLS_GLOBAL_HOOK__',
    'webpackChunk',
    'webpackJsonp',
    'sentry', // Sentry often hangs in global
    'google_tag_manager',
    '__webpack_require__',
    '__webpack_public_path__',
    '__webpack_modules__',
  ];

  for (const key of currentKeys) {
    if (!nativeKeys.has(key) && !IGNORE_LIST.some((ignore) => key.includes(ignore))) {
      try {
        // @ts-expect-error - window[key] can be any type
        const value = (window as Record<string, unknown>)[key];
        // We're only interested in data objects (not functions, not DOM elements)
        if (
          value &&
          typeof value === 'object' &&
          !(value instanceof HTMLElement) &&
          !(value instanceof Function)
        ) {
          customGlobals[key] = value;
        }
      } catch (e) {
        // Access to some iframe properties may cause error
      }
    }
  }

  return customGlobals;
}

// Recursive secret search (improved)
function scanObjectForSecrets(rootName: string, obj: any): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const seen = new WeakSet();
  const MAX_DEPTH = 5; // Protection from deep recursion

  function traverse(current: any, path: string, depth: number) {
    if (depth > MAX_DEPTH) return;
    if (!current || typeof current !== 'object') return;
    if (seen.has(current)) return;

    // Ignore Vue/React internal observers (usually start with __ or $)
    // But check if it's root data object

    seen.add(current);

    for (const [key, val] of Object.entries(current)) {
      const newPath = `${path}.${key}`;

      // 1. Check key name (password, secret, token)
      if (SUSPICIOUS_ENV_KEYS.some((k) => key.toUpperCase().includes(k))) {
        // Additional check: value should not be function or empty
        if (typeof val !== 'function') {
          issues.push({
            id: `state-key-${newPath.replace(/[^a-z0-9]/gi, '-')}`,
            category: 'html', // Category HTML/State
            severity: 'high',
            title: `Suspicious Data in Global Scope: ${newPath}`,
            description: `Found global variable "${rootName}" containing key "${key}". Value type: ${typeof val}.`,
            recommendation:
              'Ensure sensitive user data is scrubbed from the server-side payload (SSR/Hydration).',
            location: newPath,
          });
        }
      }

      // 2. Check string values for patterns (AWS keys, etc.)
      if (typeof val === 'string') {
        // Optimization: don't check short strings and too long ones (base64 images)
        if (val.length > 8 && val.length < 500) {
          const matched = SECRET_PATTERNS.find((p) => p.regex.test(val));
          if (matched) {
            issues.push({
              id: `state-val-${newPath.replace(/[^a-z0-9]/gi, '-')}`,
              category: 'html',
              severity: 'critical',
              title: `Secret Leak in Global Scope: ${newPath}`,
              description: `Found pattern "${matched.name}" in variable "${rootName}".`,
              recommendation: 'CRITICAL: Remove this secret from client-side code immediately.',
              location: newPath,
            });
          }
        }
      }

      // Go deeper
      else if (typeof val === 'object' && val !== null) {
        // Don't scan DOM nodes and Window objects
        if (
          val.constructor &&
          val.constructor.name !== 'Window' &&
          val.constructor.name !== 'HTMLDocument'
        ) {
          traverse(val, newPath, depth + 1);
        }
      }
    }
  }

  traverse(obj, rootName, 0);
  return issues;
}

// --- SCANNERS ---

// 1. Scan Env variables (Client-side exposed)
function scanEnvVars(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  // @ts-expect-error - import.meta.env available in Vite, but not typed in TypeScript
  const env = import.meta.env as Record<string, unknown>;

  for (const [key, value] of Object.entries(env)) {
    const strVal = String(value);

    // Check by key (variable name)
    const isSuspiciousKey = SUSPICIOUS_ENV_KEYS.some((k) => key.toUpperCase().includes(k));

    // Check by value (content)
    const matchedPattern = SECRET_PATTERNS.find((p) => p.regex.test(strVal));

    if (isSuspiciousKey || matchedPattern) {
      issues.push({
        id: `env-${key}`,
        category: 'env',
        severity: matchedPattern ? 'critical' : 'high',
        title: `Exposed Secret in Env: ${key}`,
        description: `Variable "${key}" is exposed to the client bundle. ${
          matchedPattern
            ? `Detected pattern: ${matchedPattern.name}`
            : 'Key name suggests sensitive data.'
        }`,
        recommendation:
          'Remove the "VITE_" prefix if this is a secret, or move it to backend-only config.',
        location: key,
      });
    }
  }
  return issues;
}

// 2. Scan HTTP headers (make HEAD request to current page)
async function scanHeaders(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];
  try {
    const res = await fetch(window.location.href, { method: 'HEAD' });
    const headers = res.headers;

    // CSP
    if (!headers.get('Content-Security-Policy')) {
      issues.push({
        id: 'header-csp',
        category: 'headers',
        severity: 'medium',
        title: 'Missing Content-Security-Policy',
        description: 'CSP helps prevent XSS attacks by controlling allowed resources.',
        recommendation: 'Configure a CSP header in your server/vite config.',
      });
    }

    // X-Content-Type-Options
    if (headers.get('X-Content-Type-Options') !== 'nosniff') {
      issues.push({
        id: 'header-nosniff',
        category: 'headers',
        severity: 'low',
        title: 'Missing X-Content-Type-Options',
        description:
          'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
        recommendation: 'Set "X-Content-Type-Options: nosniff".',
      });
    }

    // X-Frame-Options (Clickjacking)
    if (!headers.get('X-Frame-Options')) {
      issues.push({
        id: 'header-frame',
        category: 'headers',
        severity: 'medium',
        title: 'Missing X-Frame-Options',
        description: 'Allows your site to be embedded in an iframe, risking Clickjacking.',
        recommendation: 'Set "X-Frame-Options: DENY" or "SAMEORIGIN".',
      });
    }
  } catch (e) {
    console.error('[U-DevTools:Security] Failed to scan headers', e);
  }
  return issues;
}

// 3. Scan Storage (Local/Session/Cookie)
function scanStorage(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // LocalStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && SUSPICIOUS_ENV_KEYS.some((k) => key.toUpperCase().includes(k))) {
      issues.push({
        id: `ls-${key}`,
        category: 'storage',
        severity: 'medium', // Medium, as tokens are often stored in LS, but it's not best practice
        title: `Sensitive Data in LocalStorage: ${key}`,
        description: 'Storing tokens or secrets in LocalStorage makes them vulnerable to XSS.',
        recommendation: 'Consider using HttpOnly cookies for authentication tokens.',
        location: `localStorage[${key}]`,
      });
    }
  }

  // Cookies (HttpOnly check impossible from JS, but we only see those that are NOT HttpOnly)
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    cookies.forEach((c) => {
      const [key] = c.trim().split('=');
      if (key && SUSPICIOUS_ENV_KEYS.some((k) => key.toUpperCase().includes(k))) {
        issues.push({
          id: `cookie-${key}`,
          category: 'storage',
          severity: 'medium',
          title: `Accessible Cookie: ${key}`,
          description:
            'This cookie is accessible via JavaScript (not HttpOnly), vulnerable to XSS.',
          recommendation: 'Set the HttpOnly flag on sensitive cookies from the server.',
          location: `cookie[${key}]`,
        });
      }
    });
  }

  return issues;
}

// 4. Universal state scanner (Replaces scanInitialHtml)
function scanGlobalStateUniversal(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const customGlobals = getCustomGlobals();

  console.log('[U-DevTools:Security] Detected custom globals:', Object.keys(customGlobals));

  for (const [key, value] of Object.entries(customGlobals)) {
    // Scan each found global object
    issues.push(...scanObjectForSecrets(`window.${key}`, value));
  }

  return issues;
}

// 4b. Improved raw HTML scanner (Search for JSON in scripts)
// Complements universal scanner, finding data that exists in HTML but didn't make it to window (removed)
async function scanRawScriptsForSecrets(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];
  try {
    const html = await fetch(window.location.href).then((r) => r.text());

    // Check inline scripts without nonce
    const inlineScripts = html.match(/<script(?![^>]*nonce)[^>]*>/gi);
    if (inlineScripts && inlineScripts.length > 0) {
      issues.push({
        id: 'html-inline-scripts',
        category: 'html',
        severity: 'medium',
        title: 'Inline Scripts Without Nonce',
        description: `Found ${inlineScripts.length} inline <script> tags without nonce attribute. CSP requires nonce for inline scripts.`,
        recommendation:
          'Add nonce to inline scripts or move them to external files with proper CSP.',
      });
    }

    // Check comments
    if (html.includes('<!--') && (html.includes('TODO') || html.includes('FIXME'))) {
      issues.push({
        id: 'html-comments',
        category: 'html',
        severity: 'info',
        title: 'Leftover Comments in HTML',
        description: 'Found TODO/FIXME comments in the served HTML.',
        recommendation: 'Remove comments in production build.',
      });
    }

    // Search for JSON-like structures in scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach((script, idx) => {
      const content = script.textContent || '';
      if (!content) return;

      // Look for JSON-like structures containing "password": "..." or "token": "..."
      // This is heuristic: look for key in quotes, colon, and value
      const suspiciousJsonRegex =
        /["'](\w*(?:password|secret|token|key|auth)\w*)["']\s*:\s*["']([^"']+)["']/gi;

      let match: RegExpExecArray | null = suspiciousJsonRegex.exec(content);
      while (match !== null) {
        const [fullMatch, key, value] = match;

        // Check value for secret patterns
        const matched = SECRET_PATTERNS.find((p) => p.regex.test(value));

        if (matched) {
          issues.push({
            id: `script-raw-${idx}-${key}`,
            category: 'scripts',
            severity: 'critical', // Critical if secret pattern found
            title: `Secret Found in <script>: "${key}"`,
            description: `Found pattern "${matched.name}" in raw script content.`,
            recommendation: 'CRITICAL: Remove hardcoded secrets from client-side code.',
            location: `Script #${idx}, key: ${key}`,
          });
        } else if (value.length > 8) {
          // If not pattern, but value is suspiciously long
          issues.push({
            id: `script-raw-${idx}-${key}`,
            category: 'scripts',
            severity: 'medium', // Medium, as this might just be JS code, not data
            title: `Potential Secret in <script>: "${key}"`,
            description: `Found suspicious key-value pair in raw script content.`,
            recommendation: 'Check if this script contains hardcoded secrets.',
            location: `Script #${idx}, match: ${key}`,
          });
        }
        match = suspiciousJsonRegex.exec(content);
      }
    });
  } catch (e) {
    console.error('[U-DevTools:Security] Failed to scan raw scripts', e);
  }
  return issues;
}

// 5. Scan DOM (Target Blank, Forms, Mixed Content)
function scanDomNodes(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Links with target="_blank"
  const unsafeLinks = document.querySelectorAll(
    'a[target="_blank"]:not([rel*="noopener"]):not([rel*="noreferrer"])'
  );
  if (unsafeLinks.length > 0) {
    const firstLink = unsafeLinks[0] as HTMLAnchorElement;
    issues.push({
      id: 'dom-tabnabbing',
      category: 'dom',
      severity: 'medium',
      title: `Unsafe target="_blank" links (${unsafeLinks.length})`,
      description:
        'Links using target="_blank" without rel="noopener noreferrer" are vulnerable to Reverse Tabnabbing.',
      recommendation: 'Add rel="noopener noreferrer" to external links.',
      location: `First occurrence: ${firstLink.href || firstLink.getAttribute('href') || 'unknown'}`,
    });
  }

  // Insecure Forms (HTTP on HTTPS site)
  if (window.location.protocol === 'https:') {
    const insecureForms = document.querySelectorAll('form[action^="http://"]');
    if (insecureForms.length > 0) {
      issues.push({
        id: 'dom-form-http',
        category: 'dom',
        severity: 'high',
        title: 'Insecure Form Action',
        description: 'Form submits data over unencrypted HTTP.',
        recommendation: 'Change form action to HTTPS.',
      });
    }

    // Forms without CSRF tokens (heuristic: look for hidden fields with name csrf/token)
    const forms = document.querySelectorAll('form');
    forms.forEach((form, idx) => {
      const hasCsrfToken =
        form.querySelector('input[name*="csrf"], input[name*="token"], input[name*="_token"]') !==
        null;
      if (!hasCsrfToken && form.method.toLowerCase() === 'post') {
        issues.push({
          id: `dom-form-csrf-${idx}`,
          category: 'dom',
          severity: 'medium',
          title: 'Form Without CSRF Token',
          description: `Form #${idx} uses POST method but no CSRF token field detected.`,
          recommendation: 'Add CSRF token to prevent Cross-Site Request Forgery attacks.',
          location: form.action || 'current page',
        });
      }
    });
  }

  return issues;
}

// 6. Scan public files (Brute-force)
async function scanPublicSensitiveFiles(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];
  const filesToCheck = [
    '.env',
    '.env.local',
    '.env.production',
    '.git/config',
    '.git/HEAD',
    '.DS_Store',
    'docker-compose.yml',
    'backup.sql',
    'package.json',
    '.npmrc',
    'composer.json',
  ];

  // Run in parallel
  await Promise.all(
    filesToCheck.map(async (file) => {
      try {
        const res = await fetch(`/${file}`, { method: 'HEAD' });
        if (
          res.status === 200 &&
          res.headers.get('content-type')?.includes('text/html') === false
        ) {
          // Check content-type needed to not confuse with 200 OK from SPA (index.html)
          issues.push({
            id: `file-${file.replace(/[^a-z0-9]/gi, '-')}`,
            category: 'files',
            severity: 'critical',
            title: `Publicly Accessible File: ${file}`,
            description: `The file "${file}" is accessible from the root of your domain. This may leak configuration or source control data.`,
            recommendation:
              'Remove this file from the "public" directory or configure your server to deny access.',
            location: `/${file}`,
          });
        }
      } catch {
        /* ignore network errors */
      }
    })
  );

  return issues;
}

// 7. Scan global scripts for secrets and Source Maps
function scanLoadedScripts(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check Source Maps in production
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('.map')) {
      issues.push({
        id: `script-sourcemap-${src}`,
        category: 'scripts',
        severity: 'medium',
        title: 'Source Map Detected in Production',
        description: `Source map file found: ${src}. This exposes your source code structure.`,
        recommendation: 'Disable source maps in production builds.',
        location: src,
      });
    }
  });

  // Scan inline scripts for secrets
  const inlineScripts = document.querySelectorAll('script:not([src])');
  inlineScripts.forEach((script, idx) => {
    const content = script.textContent || '';
    const matched = SECRET_PATTERNS.find((p) => p.regex.test(content));

    if (matched) {
      issues.push({
        id: `script-inline-${idx}`,
        category: 'scripts',
        severity: 'critical',
        title: 'Secret found in Inline Script',
        description: `Pattern "${matched.name}" detected in inline <script> tag.`,
        recommendation: 'Remove secrets from client-side code.',
      });
    }

    // Search for TODO/FIXME/HACK comments
    if (content.match(/\/\/(\s*TODO|\s*FIXME|\s*HACK|\s*XXX)/i)) {
      issues.push({
        id: `script-comment-${idx}`,
        category: 'scripts',
        severity: 'info',
        title: 'TODO/FIXME Comment in Script',
        description:
          'Found TODO/FIXME/HACK comment in inline script. May indicate technical debt or temporary workarounds.',
        recommendation: 'Review and resolve these comments before production.',
      });
    }
  });

  return issues;
}

// 8. Scan Mixed Content
function scanMixedContent(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  if (window.location.protocol !== 'https:') {
    return issues; // Only for HTTPS pages
  }

  // Mixed Content (Images/Scripts/Styles) on HTTPS
  const mixedContent = document.querySelectorAll(
    'img[src^="http://"], script[src^="http://"], link[href^="http://"], iframe[src^="http://"]'
  );
  if (mixedContent.length > 0) {
    const firstElement = mixedContent[0] as HTMLElement;
    const src =
      (firstElement as HTMLImageElement).src ||
      (firstElement as HTMLScriptElement).src ||
      (firstElement as HTMLLinkElement).href ||
      (firstElement as HTMLIFrameElement).src ||
      'unknown';

    issues.push({
      id: 'mixed-content',
      category: 'mixed-content',
      severity: 'high',
      title: `Mixed Content Detected (${mixedContent.length})`,
      description:
        'Resources are being loaded via HTTP on an HTTPS page. They will be blocked by browsers.',
      recommendation: 'Ensure all assets are loaded via HTTPS or use protocol-relative URLs.',
      location: src,
    });
  }

  return issues;
}

// Run scanning
async function runScan(channel: BroadcastChannel) {
  const bridge = useBridge();
  console.log('[U-DevTools:Security] Starting scan...');

  // Collect everything together
  const [fileIssues, headerIssues, scriptRawIssues] = await Promise.all([
    scanPublicSensitiveFiles(),
    scanHeaders(),
    scanRawScriptsForSecrets(),
  ]);

  const stateIssues = scanGlobalStateUniversal(); // <-- Use new universal scanner
  const envIssues = scanEnvVars();
  const storageIssues = scanStorage();
  const domIssues = scanDomNodes();
  const scriptIssues = scanLoadedScripts();
  const mixedContentIssues = scanMixedContent();

  const allIssues = [
    ...stateIssues,
    ...scriptRawIssues,
    ...fileIssues,
    ...domIssues,
    ...scriptIssues,
    ...envIssues,
    ...storageIssues,
    ...headerIssues,
    ...mixedContentIssues,
  ];

  console.log('[U-DevTools:Security] Scan complete', allIssues.length, 'issues found');

  // Send via AppBridge (for communication with Client)
  bridge.send('scan-results', {
    data: allIssues,
    url: window.location.href, // Pass URL for server scanning
  });

  // Also send via BroadcastChannel for backward compatibility
  channel.postMessage({
    event: 'scan-results',
    data: allIssues,
    url: window.location.href,
  });
}

export default defineApp({
  component: undefined,
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<SecurityProtocol>;
    setupDevTools({ bridge: typedBridge });
    // Listen for command from client via BroadcastChannel (for communication with Client)
    const channel = new BroadcastChannel('u-devtools:security');
    channel.addEventListener('message', (e) => {
      if (e.data?.event === 'start-scan') {
        runScan(channel);
      }
    });

    // --- CLEANUP ---
    onCleanup(() => {
      console.log('[U-DevTools:Security] Security agent cleaning up');
      channel.close();
    });
  },
});
