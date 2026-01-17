import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { detectPackageManager, buildAuditCommand, executeCommand } from '@u-devtools/utils-node';
import type { SecurityIssue } from './types';

// Patterns for finding secrets (duplicated from utils/regex for server context)
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key', regex: /(aws|amazon).*(key|secret).*[0-9a-zA-Z/+]{40}/i },
  { name: 'Generic API Key', regex: /(api|access)[_-]?(key|token).*['"][\w-]{16,}['"]/i },
  { name: 'Private Key', regex: /-----BEGIN.*PRIVATE KEY-----/ },
  { name: 'Stripe Secret', regex: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/ },
  { name: 'Firebase Secret', regex: /([0-9a-fA-F]{32})/ },
];

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  rpc.handle('security:run-audit', async () => {
    const managerInfo = detectPackageManager(ctx.root);
    const manager = managerInfo.name;

    // Build audit command
    const cmd = buildAuditCommand(manager, true);
    if (!cmd) {
      return { success: false, error: 'Audit command not supported for this package manager' };
    }

    try {
      // pnpm audit returns exit code 1 if vulnerabilities exist, so catch is needed
      const { stdout } = await executeCommand(cmd, ctx.root).catch((e: any) => ({
        stdout: e.stdout || '{}',
      }));

      try {
        const json = JSON.parse(stdout || '{}');
        // Unify response (npm/pnpm/yarn structures differ)
        return {
          success: true,
          manager: manager,
          raw: json,
        };
      } catch (parseError) {
        return { success: false, error: 'Failed to parse audit output' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Unknown error' };
    }
  });

  // --- NEW RPC METHOD: Server response scanning ---
  rpc.handle('security:scan-server-route', async (payload: unknown) => {
    const url = typeof payload === 'string' ? payload : String(payload);
    const issues: SecurityIssue[] = [];

    try {
      console.log(`[U-DevTools:Security] Server scanning: ${url}`);

      // Make request from Node.js (as server/bot)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'U-DevTools-Security-Scanner/1.0', // Pretend to be scanner
        },
      });

      const text = await response.text();
      const headers = response.headers;

      // 1. Analyze headers "Information Disclosure" (Information disclosure)
      const disclosureHeaders = [
        'x-powered-by',
        'server',
        'x-aspnet-version',
        'x-generator',
        'x-runtime',
        'x-version',
      ];

      disclosureHeaders.forEach((header) => {
        const val = headers.get(header);
        if (val) {
          issues.push({
            id: `server-header-${header}`,
            category: 'server-response',
            severity: 'low',
            title: `Server Info Leak: ${header}`,
            description: `Server is broadcasting its technology stack: "${val}". This helps attackers target specific vulnerabilities.`,
            recommendation: `Configure your server/proxy to remove the "${header}" header.`,
            location: `Header: ${header}`,
          });
        }
      });

      // 2. Check security headers (Server-side view)
      // Often nginx/proxy settings differ from what browser sees
      if (!headers.get('strict-transport-security') && url.startsWith('https')) {
        issues.push({
          id: 'server-hsts',
          category: 'server-response',
          severity: 'medium',
          title: 'Missing HSTS Header',
          description: 'HTTP Strict Transport Security is missing. Allows MITM downgrade attacks.',
          recommendation: 'Add "Strict-Transport-Security" header.',
        });
      }

      // 3. Search for secrets in RAW HTML (SSR Leaks)
      // Look for what might have been erased by hydration
      SECRET_PATTERNS.forEach((pattern) => {
        if (pattern.regex.test(text)) {
          // Find context (some text around)
          const match = text.match(pattern.regex);
          const snippet = match ? match[0].substring(0, 50) + '...' : '';

          issues.push({
            id: `server-body-secret-${pattern.name.replace(/\s+/g, '-')}`,
            category: 'server-response',
            severity: 'critical',
            title: `Secret Leak in Raw HTML: ${pattern.name}`,
            description: `Found pattern "${pattern.name}" in the server response body (HTML source). This might be an SSR leak. Match: ${snippet}`,
            recommendation: 'Ensure secrets are not serialized into the HTML during SSR.',
            location: 'index.html (Source)',
          });
        }
      });

      // 4. Heuristic: Search for forgotten configs in HTML
      if (
        text.includes('Standard-User-Password') ||
        text.includes('Default_Token') ||
        text.includes('admin:admin') ||
        text.includes('test:test')
      ) {
        issues.push({
          id: 'server-heuristic',
          category: 'server-response',
          severity: 'high',
          title: 'Potential Default Credentials',
          description: 'Found words like "Default_Token" or default credentials in HTML source.',
          recommendation: 'Check for hardcoded testing credentials.',
        });
      }

      // 5. Search for JSON-like structures with suspicious keys in HTML
      const suspiciousJsonRegex =
        /["'](\w*(?:password|secret|token|key|auth|credential)\w*)["']\s*:\s*["']([^"']{8,})["']/gi;

      let match: RegExpExecArray | null = null;
      let matchCount = 0;
      while (matchCount < 10) {
        match = suspiciousJsonRegex.exec(text);
        if (match === null) break;
        matchCount++;
        const [fullMatch, key, value] = match;

        // Check value for secret patterns
        const matchedPattern = SECRET_PATTERNS.find((p) => p.regex.test(value));

        if (matchedPattern) {
          issues.push({
            id: `server-json-secret-${matchCount}`,
            category: 'server-response',
            severity: 'critical',
            title: `Secret in HTML JSON: "${key}"`,
            description: `Found pattern "${matchedPattern.name}" in JSON-like structure within HTML source.`,
            recommendation: 'Remove secrets from SSR payload immediately.',
            location: `HTML source, key: ${key}`,
          });
        } else if (value.length > 16) {
          // If value is long but not pattern - still flag it
          issues.push({
            id: `server-json-suspicious-${matchCount}`,
            category: 'server-response',
            severity: 'high',
            title: `Suspicious Data in HTML JSON: "${key}"`,
            description: `Found suspicious key-value pair in HTML source. Value length: ${value.length} characters.`,
            recommendation: 'Verify that sensitive data is not exposed in SSR payload.',
            location: `HTML source, key: ${key}`,
          });
        }
      }

      return { success: true, issues };
    } catch (e: any) {
      console.error('[U-DevTools:Security] Server scan error:', e);
      return {
        success: false,
        error: e.message || 'Unknown error',
        issues: [], // Return empty array if request failed
      };
    }
  });
}
