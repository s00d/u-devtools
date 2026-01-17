import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type {
  SeoTags,
  JsonLdItem,
  HreflangItem,
  HeadingItem,
  ImageItem,
  ManifestData,
  IconData,
  KeywordItem,
  LinkItem,
  SeoProtocol,
} from './types';
import { validateSchema } from './utils/schema-validator';
import { analyzeText } from './utils/text-analysis';

let bridge: AppBridge<SeoProtocol>;

function getMeta(name: string): string {
  const els = document.querySelectorAll(`meta[name="${name}"], meta[property="${name}"]`);
  // Check for duplicates
  if (els.length > 1) {
    console.warn(
      `[U-DevTools:SEO] Multiple meta tags found for "${name}": ${els.length} duplicates`
    );
  }
  return els[0]?.getAttribute('content') || '';
}

function resolveUrl(url: string): string {
  if (!url) return '';
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function getJsonLd(): JsonLdItem[] {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const items: JsonLdItem[] = [];

  scripts.forEach((script, idx) => {
    const raw = script.textContent || '';
    try {
      const data = JSON.parse(raw);

      // Handle @graph (WordPress/Yoast style) - if @graph exists, use it
      let entries: any[] = [];
      if (data['@graph'] && Array.isArray(data['@graph'])) {
        entries = data['@graph'];
      } else if (Array.isArray(data)) {
        // Array at root
        entries = data;
      } else {
        // Single object
        entries = [data];
      }

      entries.forEach((entry: any, graphIdx: number) => {
        const { errors, warnings, type } = validateSchema(entry);
        items.push({
          id: idx * 1000 + graphIdx,
          type,
          data: entry,
          raw,
          isValidJson: true,
          errors,
          warnings,
        });
      });
    } catch (e: unknown) {
      items.push({
        id: idx,
        type: 'Invalid JSON',
        data: null,
        raw,
        isValidJson: false,
        errors: [`Syntax Error: ${e instanceof Error ? e.message : String(e)}`],
        warnings: [],
      });
    }
  });

  return items;
}

function getHreflangs(): HreflangItem[] {
  const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
  return Array.from(links).map((link) => ({
    lang: link.getAttribute('hreflang') || '',
    url: link.getAttribute('href') || '',
    isSelf: link.getAttribute('href') === window.location.href,
  }));
}

function getHeadings(): HeadingItem[] {
  const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headings: HeadingItem[] = [];
  let lastLevel = 0;
  let h1Count = 0;

  elements.forEach((el) => {
    const level = parseInt(el.tagName[1]);
    const text = (el.textContent || '').trim();
    let issue: string | undefined = undefined;

    if (level === 1) h1Count++;

    // Check order (cannot jump from H2 to H4)
    if (lastLevel > 0 && level > lastLevel + 1) {
      issue = `Skipped heading level (H${lastLevel} -> H${level})`;
    }

    headings.push({ tag: el.tagName.toLowerCase(), text, level, issue });
    lastLevel = level;
  });

  // Post-validation
  if (h1Count === 0)
    headings.unshift({
      tag: 'alert',
      text: 'Missing H1 tag!',
      level: 0,
      issue: 'Critical',
    });
  if (h1Count > 1) {
    headings.forEach((h) => {
      if (h.tag === 'h1') h.issue = h.issue || 'Multiple H1 tags found (not recommended)';
    });
  }

  return headings;
}

function getManifest(): ManifestData {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  const href = manifestLink?.getAttribute('href');

  if (!href) {
    return { exists: false };
  }

  const url = resolveUrl(href);
  return {
    exists: true,
    url,
  };
}

function getIcons(): IconData[] {
  const links = document.querySelectorAll(
    'link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"]'
  );
  return Array.from(links).map((link) => ({
    rel: link.getAttribute('rel') || '',
    href: resolveUrl(link.getAttribute('href') || ''),
    sizes: link.getAttribute('sizes') || undefined,
    type: link.getAttribute('type') || undefined,
    purpose: link.getAttribute('purpose') || undefined,
  }));
}

function getDnsPrefetch(): string[] {
  const links = document.querySelectorAll('link[rel="dns-prefetch"]');
  return Array.from(links)
    .map((link) => link.getAttribute('href') || '')
    .filter(Boolean);
}

function getPreconnect(): string[] {
  const links = document.querySelectorAll('link[rel="preconnect"]');
  return Array.from(links)
    .map((link) => link.getAttribute('href') || '')
    .filter(Boolean);
}

function getImages(): ImageItem[] {
  const elements = document.querySelectorAll('img');
  const badAlts = ['image', 'img', 'photo', 'picture', 'filename.jpg', 'untitled', 'dsc', 'img_'];

  return Array.from(elements).map((img) => {
    const naturalW = img.naturalWidth;
    const clientW = img.clientWidth;
    // If image is 3x larger than container - it's traffic waste (for retina x2 ok, but x3+ is overkill)
    const isResized = naturalW > 0 && clientW > 0 && naturalW > clientW * 3;

    let issue: string | undefined = undefined;
    const altLower = img.alt.toLowerCase().trim();

    if (!img.alt) {
      issue = 'Missing alt text';
    } else if (
      badAlts.some(
        (bad) =>
          altLower === bad ||
          altLower.startsWith(bad) ||
          altLower.endsWith('.jpg') ||
          altLower.endsWith('.png')
      )
    ) {
      issue = 'Weak alt text (avoid generic names)';
    } else if (isResized) {
      issue = 'Oversized image (performance)';
    }

    return {
      src: img.src,
      alt: img.alt || '',
      title: img.title || '',
      naturalDimensions: `${img.naturalWidth}x${img.naturalHeight}`,
      displayDimensions: `${img.clientWidth}x${img.clientHeight}`,
      isResized,
      issue,
    };
  });
}

function getKeywordsAnalysis(): KeywordItem[] {
  const text = document.body.innerText.toLowerCase();
  // Remove punctuation and split
  const words = text
    .replace(/[^\w\sа-яёa-z]/gi, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const frequency: Record<string, number> = {};
  for (const w of words) {
    frequency[w] = (frequency[w] || 0) + 1;
  }

  // Sort top-10
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / words.length) * 100).toFixed(2),
    }));
}

function getLinks(): LinkItem[] {
  const items: LinkItem[] = [];
  const currentHost = window.location.hostname;

  // 1. Anchors
  document.querySelectorAll('a[href]').forEach((el) => {
    const a = el as HTMLAnchorElement;
    const href = a.href; // Browser normalizes to absolute URL

    // Ignore javascript:, mailto:, tel:
    if (!href.startsWith('http')) return;

    const hasNoopener = a.rel.includes('noopener') || a.rel.includes('noreferrer');
    let issue: string | undefined = undefined;
    if (a.hostname !== currentHost && a.target === '_blank' && !hasNoopener) {
      issue = 'Missing noopener (security risk)';
    }

    items.push({
      element: 'a',
      text: (a.innerText || a.getAttribute('aria-label') || '').slice(0, 50).trim() || href,
      href: href,
      isExternal: a.hostname !== currentHost,
      rel: a.rel || undefined,
      target: a.target || undefined,
      hasNoopener,
      issue,
    });
  });

  // 2. Images (Broken images are bad for SEO)
  document.querySelectorAll('img[src]').forEach((el) => {
    const img = el as HTMLImageElement;
    if (!img.src.startsWith('http')) return;

    try {
      const imgUrl = new URL(img.src);
      items.push({
        element: 'img',
        text: (img.alt || img.title || 'image').slice(0, 50),
        href: img.src,
        isExternal: imgUrl.hostname !== currentHost,
      });
    } catch {
      // Invalid URL, skip
    }
  });

  // 3. Link tags (stylesheet, canonical, etc.)
  document.querySelectorAll('link[href]').forEach((el) => {
    const link = el as HTMLLinkElement;
    if (!link.href.startsWith('http')) return;

    try {
      const linkUrl = new URL(link.href);
      items.push({
        element: 'link',
        text: link.rel || 'link',
        href: link.href,
        isExternal: linkUrl.hostname !== currentHost,
        rel: link.rel || undefined,
      });
    } catch {
      // Invalid URL, skip
    }
  });

  return items;
}

function getTextContent(): string {
  // Clone body to avoid breaking DOM during cleanup
  const clone = document.body.cloneNode(true) as HTMLElement;

  // Remove junk tags from analysis
  const toRemove = clone.querySelectorAll(
    'script, style, noscript, iframe, svg, header, nav, footer'
  );
  for (const el of toRemove) {
    el.remove();
  }

  return clone.innerText || '';
}

function scanSeo(): SeoTags {
  return {
    title: document.title,
    description: getMeta('description'),
    metaKeywords: getMeta('keywords'),
    robots: getMeta('robots'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',

    // OG
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: resolveUrl(getMeta('og:image')),
    ogUrl: getMeta('og:url'),
    ogType: getMeta('og:type'),
    ogSiteName: getMeta('og:site_name'),

    // Twitter
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterDescription: getMeta('twitter:description'),
    twitterImage: resolveUrl(getMeta('twitter:image')),
    twitterSite: getMeta('twitter:site'),

    // New
    jsonLd: getJsonLd(),
    hreflangs: getHreflangs(),
    favicon: document.querySelector('link[rel~="icon"]')?.getAttribute('href') || '/favicon.ico',
    appleTouchIcon:
      document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') || '',
    headings: getHeadings(),
    images: getImages(),
    manifest: getManifest(),
    icons: getIcons(),
    themeColor:
      getMeta('theme-color') ||
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ||
      '',
    viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
    charset:
      document.querySelector('meta[charset]')?.getAttribute('charset') ||
      document.querySelector('meta[http-equiv="content-type"]')?.getAttribute('content') ||
      '',
    language: document.documentElement.lang || '',
    generator: getMeta('generator'),
    dnsPrefetch: getDnsPrefetch(),
    preconnect: getPreconnect(),
    // New features
    keywordDensity: getKeywordsAnalysis(),
    links: getLinks(),
    // Text analysis
    textStats: analyzeText(getTextContent()),
  };
}

// Debounce helper
function debounce(fn: (...args: any[]) => void, ms: number) {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

// Эти функции будут определены в setup

export default defineApp({
  component: undefined,
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<SeoProtocol>;
    setupDevTools({ bridge: typedBridge });
    bridge = typedBridge; // Update global reference
    
    const sendScanResult = () => {
      typedBridge.send('scan-result', {
        tags: scanSeo(),
        url: window.location.href, // Use href, not origin, to check specific page
      });
    };

    // Create "lazy" version of send
    // 500ms is usually enough for Vue/React/Router to update <head> after navigation
    const debouncedScan = debounce(sendScanResult, 500);

    // Request from client (manual refresh) - send immediately
    typedBridge.on('scan', sendScanResult);

    // MutationObserver - use debounce to avoid spamming on every attribute change
    const observer = new MutationObserver(() => {
      debouncedScan();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Initial send:
    // Wait for `load` event or just delay if script is loaded asynchronously
    if (document.readyState === 'complete') {
      debouncedScan();
    } else {
      window.addEventListener('load', () => {
        // Wait a bit more after load, as frameworks often mount after it
        setTimeout(sendScanResult, 500);
      });
    }

    // --- CLEANUP ---
    onCleanup(() => {
      console.log('[U-DevTools:SEO] SEO agent cleaning up');
      observer.disconnect();
    });
  },
});
