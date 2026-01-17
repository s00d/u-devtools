import { Tiktoken } from 'js-tiktoken/lite';

// Cache for the encoding to avoid reloading
let cachedEncoding: Tiktoken | null = null;
let loadingPromise: Promise<Tiktoken> | null = null;

/**
 * Load cl100k_base encoding (used by GPT-4)
 * Uses static import for Node.js, CDN for browser
 */
async function loadEncoding(): Promise<Tiktoken> {
  if (cachedEncoding) {
    return cachedEncoding;
  }

  // If already loading, wait for that promise
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      // Check if we're in Node.js environment
      const isNode = typeof process !== 'undefined' && process.versions?.node;
      
      if (isNode) {
        // Use static import for Node.js (server-side)
        const cl100k_base = await import('js-tiktoken/ranks/cl100k_base').then((m) => m.default);
        cachedEncoding = new Tiktoken(cl100k_base);
        return cachedEncoding;
      } else {
        // Use CDN for browser (client-side)
        const res = await fetch('https://tiktoken.pages.dev/js/cl100k_base.json');
        if (!res.ok) {
          throw new Error(`Failed to fetch encoding: ${res.statusText}`);
        }
        const cl100k_base = await res.json();
        cachedEncoding = new Tiktoken(cl100k_base);
        return cachedEncoding;
      }
    } catch (error) {
      console.error('[repo2txt] Failed to load encoding:', error);
      throw new Error('Failed to load tiktoken encoding');
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Count tokens in text using GPT-4 tokenizer (cl100k_base)
 */
export async function countTokens(content: string): Promise<number> {
  try {
    const encoding = await loadEncoding();
    const tokens = encoding.encode(content);
    return tokens.length;
  } catch (error) {
    // Fallback: approximate token count (roughly 4 chars per token)
    console.warn('[repo2txt] Token counting failed, using approximation:', error);
    return Math.ceil(content.length / 4);
  }
}

/**
 * Check if file is binary by examining first 1KB
 */
export function isBinaryFile(content: Buffer | string): boolean {
  const bytes = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
  const sample = bytes.slice(0, 1024);
  
  // Check for null bytes (common in binary files)
  if (sample.includes(0)) {
    return true;
  }
  
  // Check for high percentage of non-printable characters
  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    // Allow common whitespace and printable ASCII
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintable++;
    }
  }
  
  // If more than 30% non-printable, likely binary
  return nonPrintable / sample.length > 0.3;
}
