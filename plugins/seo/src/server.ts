import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import type { FileCheckResult, ServerCheckData } from './types';
import https from 'node:https';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // Create HTTPS agent that ignores self-signed certificate errors
  // This is needed for local dev servers with HTTPS (e.g., vite-plugin-mkcert)
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  // Check if URL is local
  const isLocalUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname.toLowerCase();
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')
      );
    } catch {
      return false;
    }
  };

  // Helper for creating fetch options with local HTTPS support
  const getFetchOptions = (urlString: string, additionalHeaders?: Record<string, string>) => {
    const options: RequestInit & { agent?: https.Agent } = {
      headers: additionalHeaders || {},
    };

    // For local HTTPS URLs use agent that ignores certificate errors
    // Node.js 18+ fetch uses undici, which supports agent
    if (urlString.startsWith('https://') && isLocalUrl(urlString)) {
      options.agent = httpsAgent;
    }

    return options;
  };

  // Helper for smart URL checking
  const checkUrl = async (url: string, type: 'robots' | 'sitemap'): Promise<FileCheckResult> => {
    try {
      const res = await fetch(url, {
        ...getFetchOptions(url, {
          // Important: explicitly request correct type so normal servers don't return HTML
          Accept: type === 'robots' ? 'text/plain' : 'application/xml, text/xml',
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      const cleanText = text.trim();

      // 1. Check for SPA Fallback (HTML instead of file)
      const isHtml =
        contentType.includes('text/html') ||
        cleanText.toLowerCase().startsWith('<!doctype html') ||
        cleanText.toLowerCase().startsWith('<html');

      if (isHtml) {
        return {
          exists: false,
          status: res.status, // Probably 200, but actually not the right file
          url,
          error: 'SPA Fallback detected (Received HTML instead of file)',
          size: text.length,
        };
      }

      // 2. Content validation
      let isValidContent = true;
      let contentError = '';

      if (type === 'robots') {
        // robots.txt must contain directives
        if (!cleanText.toLowerCase().includes('user-agent:')) {
          isValidContent = false;
          contentError = 'Invalid content: missing "User-agent" directive';
        }
      } else if (type === 'sitemap') {
        // sitemap must be XML
        if (
          !cleanText.startsWith('<?xml') &&
          !cleanText.includes('<urlset') &&
          !cleanText.includes('<sitemapindex')
        ) {
          isValidContent = false;
          contentError = "Invalid content: doesn't look like an XML sitemap";
        }
      }

      if (!res.ok) {
        return {
          exists: false,
          status: res.status,
          url,
          error: `HTTP ${res.status}`,
        };
      }

      // If file exists (200 OK), not HTML, but content is strange -> Warning
      if (!isValidContent) {
        return {
          exists: true, // File physically exists, but it's "broken"
          status: res.status,
          url,
          size: text.length,
          contentSnippet: text.substring(0, 100),
          warning: contentError, // Pass as warning
        };
      }

      // Everything is fine
      return {
        exists: true,
        status: res.status,
        url,
        size: text.length,
        contentSnippet: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      };
    } catch (e: unknown) {
      return {
        exists: false,
        status: 0,
        url,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  };

  rpc.handle('seo:check-server-files', async (payload: unknown) => {
    const baseUrl = typeof payload === 'string' ? payload : String(payload);
    // Remove trailing slash if present
    const cleanBase = baseUrl.replace(/\/$/, '');

    const [robots, sitemap] = await Promise.all([
      checkUrl(`${cleanBase}/robots.txt`, 'robots'),
      checkUrl(`${cleanBase}/sitemap.xml`, 'sitemap'),
    ]);

    return { robots, sitemap } as ServerCheckData;
  });

  // Get file content from server
  rpc.handle('seo:fetch-file', async (payload: unknown) => {
    const url = typeof payload === 'string' ? payload : String(payload);
    try {
      const res = await fetch(url, {
        method: 'GET',
        ...getFetchOptions(url),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const content = await res.text();
      return {
        success: true,
        content,
        contentType: res.headers.get('content-type') || 'text/plain',
        size: content.length,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });

  // Get "raw" HTML from server
  rpc.handle('seo:get-raw-html', async (payload: unknown) => {
    const url = payload as string;
    if (typeof url !== 'string') {
      return { success: false, error: 'Invalid URL provided', html: '' };
    }

    try {
      const res = await fetch(url, {
        ...getFetchOptions(url, {
          // Pretend to be a normal browser or bot so server doesn't get scared
          'User-Agent': 'U-DevTools-SEO-Scanner/1.0',
          Accept: 'text/html',
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const html = await res.text();
      return { success: true, html };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        html: '',
      };
    }
  });

  // HTTP headers scanning for SEO analysis
  rpc.handle('seo:scan-headers', async (payload: unknown) => {
    const url = typeof payload === 'string' ? payload : String(payload);
    if (!url) {
      return { success: false, error: 'Invalid URL provided' };
    }

    try {
      // Use HEAD request to get only headers (faster)
      const res = await fetch(url, {
        method: 'HEAD',
        ...getFetchOptions(url, {
          'User-Agent': 'U-DevTools-SEO-Scanner/1.0',
        }),
      });

      const headers: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
      });

      return {
        success: true,
        headers,
        status: res.status,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });

  // RPC: Check Link Status
  rpc.handle('seo:check-link', async (payload: unknown) => {
    const url = typeof payload === 'string' ? payload : String(payload);
    if (!url) {
      return { success: false, error: 'Invalid URL provided' };
    }

    try {
      // Use HEAD request with redirect: 'manual' to catch redirects
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual' as RequestRedirect, // Important: don't follow redirect automatically
        ...getFetchOptions(url, {
          'User-Agent': 'U-DevTools-SEO-Scanner/1.0',
        }),
      });

      let status = res.status;
      let redirectUrl: string | undefined = undefined;

      // If redirect, try to find out where
      if (status >= 300 && status < 400) {
        redirectUrl = res.headers.get('location') || undefined;
      } else if (status === 405) {
        // Some servers don't like HEAD, try GET
        const getRes = await fetch(url, {
          method: 'GET',
          redirect: 'manual' as RequestRedirect,
          ...getFetchOptions(url, {
            'User-Agent': 'U-DevTools-SEO-Scanner/1.0',
          }),
        });
        status = getRes.status;
        if (status >= 300 && status < 400) {
          redirectUrl = getRes.headers.get('location') || undefined;
        }
      }

      return { success: true, status, redirectUrl };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });

  // Check robots.txt for specific URL
  rpc.handle('seo:check-robots', async (payload: unknown) => {
    const { url, robotsTxt } = payload as {
      url: string;
      robotsTxt: string;
    };

    if (typeof url !== 'string' || typeof robotsTxt !== 'string') {
      return {
        isAllowed: true,
        reason: 'Invalid parameters',
      };
    }

    try {
      const path = new URL(url).pathname;
      const result = checkRobots(robotsTxt, path);
      return {
        isAllowed: result.isAllowed,
        reason: result.reason,
        rules: result.rules,
      };
    } catch (e: unknown) {
      return {
        isAllowed: true,
        reason: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  });

  // Unlighthouse integration
  let unlighthouse: any = null;
  let serverInstance: any = null;

  const initUnlighthouse = async (siteUrl: string) => {
    if (unlighthouse) return;

    try {
      // Dynamic import to avoid breaking build if package is not installed
      const { createUnlighthouse } = await import('@unlighthouse/core');
      const { createServer } = await import('@unlighthouse/server');

      unlighthouse = await createUnlighthouse(
        {
          root: ctx.root,
          site: siteUrl,
          scanner: {
            device: 'desktop',
            skipJavascript: false,
            samples: 1,
          },
          debug: true,
        },
        { name: 'u-devtools' }
      );

      // Create Unlighthouse server
      // createServer returns { server: listhen instance, app: h3 instance }
      const { server, app } = await createServer();
      serverInstance = { server, app };

      // According to documentation: server.url, server.server, app
      await unlighthouse.setServerContext({
        url: server.url || 'http://localhost:5678',
        server: server.server, // listhen server instance
        app: app, // h3 app instance
      });

      // Hooks for sending progress to client
      unlighthouse.hooks.hook('task-started', (path: string) => {
        rpc.broadcast('seo:unlighthouse-update', {
          path,
          status: 'in-progress',
        });
      });

      unlighthouse.hooks.hook('task-complete', (path: string, response: any) => {
        const scores = response.report?.categories
          ? {
              performance: response.report.categories.performance?.score ?? null,
              accessibility: response.report.categories.accessibility?.score ?? null,
              'best-practices': response.report.categories['best-practices']?.score ?? null,
              seo: response.report.categories.seo?.score ?? null,
              pwa: response.report.categories.pwa?.score ?? null,
            }
          : null;

        rpc.broadcast('seo:unlighthouse-update', {
          path,
          status: 'completed',
          score: scores,
          seo: response.seo,
        });
      });

      unlighthouse.hooks.hook('worker-finished', () => {
        rpc.broadcast('seo:unlighthouse-finished', {});
      });
    } catch (e: unknown) {
      console.error('[U-DevTools:SEO] Unlighthouse not available:', e);
      throw e;
    }
  };

  // RPC: Start Unlighthouse scan
  rpc.handle('seo:unlighthouse-start', async (payload: unknown) => {
    const siteUrl = payload as string;
    if (typeof siteUrl !== 'string') {
      return { success: false, error: 'Invalid URL provided' };
    }

    try {
      await initUnlighthouse(siteUrl);
      unlighthouse.setSiteUrl(siteUrl);
      await unlighthouse.start();
      return { success: true };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unlighthouse not available',
      };
    }
  });

  // RPC: Get current results
  rpc.handle('seo:unlighthouse-get-reports', async () => {
    if (!unlighthouse) return [];

    try {
      const routes = unlighthouse.worker.routeReports || [];
      return Array.from(routes.values()).map((r: any) => ({
        id: r.reportId,
        path: r.route.path,
        status: r.tasks.runLighthouseTask ? 'completed' : 'waiting',
        score: r.report?.categories
          ? {
              performance: r.report.categories.performance?.score ?? null,
              accessibility: r.report.categories.accessibility?.score ?? null,
              'best-practices': r.report.categories['best-practices']?.score ?? null,
              seo: r.report.categories.seo?.score ?? null,
              pwa: r.report.categories.pwa?.score ?? null,
            }
          : null,
        seo: r.seo,
      }));
    } catch (e: unknown) {
      console.error('[U-DevTools:SEO] Failed to get reports:', e);
      return [];
    }
  });
}

// Simple matcher for robots.txt (no external dependencies)
function checkRobots(
  robotsTxt: string,
  path: string,
  userAgent = 'Googlebot'
): {
  isAllowed: boolean;
  reason?: string;
  rules?: Array<{ line: number; rule: string }>;
} {
  const lines = robotsTxt.split('\n');
  let currentAgent = '';
  let isDenied = false;
  const rules: Array<{ line: number; rule: string }> = [];
  let denyLine = 0;
  let denyRuleText = '';

  lines.forEach((line, index) => {
    const clean = line.split('#')[0].trim();
    if (!clean) return;

    const [key, ...vals] = clean.split(':');
    const val = vals.join(':').trim();

    if (key.toLowerCase() === 'user-agent') {
      currentAgent = val;
    } else if (
      key.toLowerCase() === 'disallow' &&
      (currentAgent === '*' || currentAgent.includes(userAgent))
    ) {
      if (val === '') {
        // Empty Disallow means allow all
        isDenied = false;
        denyLine = 0;
        denyRuleText = '';
      } else if (path.startsWith(val)) {
        isDenied = true;
        denyLine = index + 1;
        denyRuleText = `Disallow: ${val}`;
        rules.push({ line: index + 1, rule: `Disallow: ${val}` });
      }
    } else if (
      key.toLowerCase() === 'allow' &&
      (currentAgent === '*' || currentAgent.includes(userAgent))
    ) {
      if (path.startsWith(val)) {
        isDenied = false; // Allow overrides Disallow (simplified)
        denyLine = 0;
        denyRuleText = '';
        rules.push({ line: index + 1, rule: `Allow: ${val}` });
      }
    }
  });

  return {
    isAllowed: !isDenied,
    reason: isDenied && denyLine > 0 ? `Blocked by line ${denyLine}: ${denyRuleText}` : undefined,
    rules: rules.length > 0 ? rules : undefined,
  };
}
