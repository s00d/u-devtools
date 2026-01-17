export interface JsonLdItem {
  id: number;
  type: string; // "Product", "Article", etc.
  data: any; // Parsed object
  raw: string; // Original text (if JSON is broken)
  isValidJson: boolean;
  errors: string[]; // Critical errors (syntax, missing @type)
  warnings: string[]; // Recommendations (no image, no price)
}

export interface HreflangItem {
  lang: string;
  url: string;
  isSelf: boolean; // Link to itself
}

export interface SeoTags {
  title: string;
  description: string;
  canonical: string;
  metaKeywords?: string; // Meta keywords tag (deprecated, but sometimes used)
  robots: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  // Twitter
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  // New
  jsonLd: JsonLdItem[];
  hreflangs: HreflangItem[];
  favicon: string;
  appleTouchIcon: string;
  headings: HeadingItem[];
  images: ImageItem[];
  // Technical details
  manifest?: ManifestData;
  icons: IconData[];
  themeColor?: string;
  viewport?: string;
  charset?: string;
  language?: string;
  generator?: string;
  dnsPrefetch?: string[];
  preconnect?: string[];
  // New features
  keywordDensity?: KeywordItem[]; // Keyword density analysis
  links?: LinkItem[];
  textStats?: TextStats; // Full page text analysis
}

export interface ManifestData {
  name?: string;
  shortName?: string;
  description?: string;
  startUrl?: string;
  display?: string;
  themeColor?: string;
  backgroundColor?: string;
  icons?: Array<{ src: string; sizes?: string; type?: string }>;
  exists: boolean;
  url?: string;
}

export interface IconData {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
  purpose?: string;
}

export interface FileCheckResult {
  exists: boolean;
  url: string;
  size?: number;
  error?: string;
  warning?: string; // Warning about incorrect content
  contentSnippet?: string; // First 100 characters
  status: number;
}

export interface ServerCheckData {
  robots: FileCheckResult;
  sitemap: FileCheckResult;
}

export interface HeadingItem {
  tag: string; // 'h1' | 'h2' ...
  text: string;
  level: number;
  issue?: string; // "Skipped level", "Duplicate H1"
}

export interface ImageItem {
  src: string;
  alt: string;
  title: string;
  naturalDimensions: string; // "1920x1080"
  displayDimensions: string; // "300x200"
  isResized: boolean; // If real size is much larger than displayed
  issue?: string; // "Missing alt" | "Weak alt text"
}

export interface KeywordItem {
  word: string;
  count: number;
  density: string; // percentage in format "2.5%" or "0.05"
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  keywords: KeywordItem[];
}

export interface LinkItem {
  element: string; // 'a', 'img', 'link'
  text: string; // Anchor or alt
  href: string;
  isExternal: boolean;
  rel?: string;
  target?: string;
  status?: number; // 200, 404...
  redirectUrl?: string; // If there was redirect
  loading?: boolean;
  issue?: string; // "Missing noopener" | "Broken link"
  hasNoopener?: boolean; // For backward compatibility
}

export interface LighthouseScore {
  performance: number | null;
  accessibility: number | null;
  'best-practices': number | null;
  seo: number | null;
  pwa?: number | null;
}

export interface RouteReport {
  id: string;
  path: string;
  status: 'completed' | 'waiting';
  score: LighthouseScore | null;
  seo?: any;
}

/**
 * Protocol definition for SEO plugin
 */
export interface SeoProtocol {
  // Events sent from App to Client
  'scan-result': (data: { tags: SeoTags; url: string }) => void;

  // Events sent from Client to App
  'scan': () => void;
}
