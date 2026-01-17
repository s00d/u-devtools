[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-seo

# @u-devtools/plugin-seo

SEO Studio plugin for Universal DevTools. Analyzes meta tags, validates content, and provides pixel-perfect social media previews.

## Features

- **Live Meta Tag Scanning**: Automatically scans and monitors `<head>` tags using MutationObserver
- **Pixel-Perfect Previews**: Real-time previews for Google, Facebook, Twitter, Telegram, and LinkedIn
- **Content Validation**: Validates title and description lengths according to Google/Facebook standards
- **Server File Checks**: Verifies existence of `robots.txt` and `sitemap.xml`
- **Open Graph & Twitter Cards**: Full support for OG tags and Twitter Card metadata

## Installation

```bash
npm install -D @u-devtools/plugin-seo
# or
pnpm add -D @u-devtools/plugin-seo
# or
yarn add -D @u-devtools/plugin-seo
```

## Usage

Add the plugin to your Vite config:

```typescript
import { defineConfig } from 'vite';
import { createDevTools } from '@u-devtools/vite';
import { seoPlugin } from '@u-devtools/plugin-seo';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        seoPlugin(),
      ],
    }),
  ],
});
```

## How It Works

1. **Browser-side scanning** (`app.ts`):
   - Scans `<head>` for meta tags, Open Graph, and Twitter Card tags
   - Uses MutationObserver to detect changes in SPA applications
   - Resolves relative URLs to absolute URLs

2. **Server-side checks** (`node.ts`):
   - Checks for `robots.txt` and `sitemap.xml` via HTTP requests
   - Returns file size and status codes

3. **UI** (`SeoPanel.vue`):
   - Split view: Analysis on left, Live previews on right
   - Real-time validation with color-coded feedback
   - Pixel-perfect social media card previews

## Validation Rules

- **Title**: 30-60 characters (optimal: 50-60)
- **Description**: 110-160 characters (optimal: 120-160)
- **Open Graph Image**: Required for social sharing
- **Twitter Card**: Recommended for better Twitter previews

## License

MIT

## Variables

- [plugin](variables/plugin.md)

## Functions

- [seoPlugin](functions/seoPlugin.md)
