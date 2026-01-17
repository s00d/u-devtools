import type { SeoTags } from '../types';

export interface DiffResult {
  key: string;
  label: string;
  clientValue: string;
  serverValue: string;
  status: 'match' | 'mismatch' | 'client-only' | 'server-only';
}

// Function to extract data from Document (real or virtual)
export function extractSeoFromDoc(doc: Document): Partial<SeoTags> {
  const getMeta = (name: string) =>
    doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content') ||
    '';

  return {
    title: doc.title,
    description: getMeta('description'),
    robots: getMeta('robots'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
  };
}

export function compareSeo(clientData: Partial<SeoTags>, serverHtml: string): DiffResult[] {
  // Parse HTML string into virtual DOM document
  const parser = new DOMParser();
  const serverDoc = parser.parseFromString(serverHtml, 'text/html');
  const serverData = extractSeoFromDoc(serverDoc);

  const keys: { k: keyof SeoTags; l: string }[] = [
    { k: 'title', l: 'Title' },
    { k: 'description', l: 'Description' },
    { k: 'robots', l: 'Robots' },
    { k: 'canonical', l: 'Canonical' },
    { k: 'ogTitle', l: 'OG Title' },
    { k: 'ogDescription', l: 'OG Desc' },
    { k: 'ogImage', l: 'OG Image' },
  ];

  // Helper for text normalization (remove multiple spaces and line breaks)
  const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();

  // Helper to convert any value to string for comparison
  const valueToString = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return keys.map(({ k, l }) => {
    const cVal = normalize(valueToString(clientData[k]));
    const sVal = normalize(valueToString(serverData[k]));

    let status: DiffResult['status'] = 'match';

    if (cVal !== sVal) {
      if (!cVal && sVal) status = 'server-only';
      else if (cVal && !sVal)
        status = 'client-only'; // IMPORTANT: This is a problem for SEO (if Google doesn't execute JS)
      else status = 'mismatch';
    }

    return {
      key: k,
      label: l,
      clientValue: cVal,
      serverValue: sVal,
      status,
    };
  });
}
