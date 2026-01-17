/**
 * Vite Plugin: UDevTools Locator
 * Injects data-udt-loc attributes into HTML tags during dev server transformation
 * This provides reliable source location mapping without AST parsing
 */

import type { Plugin } from 'vite';
import MagicString from 'magic-string';

const TARGET_RE = /\.(vue|jsx|tsx|svelte|astro)$/;

export function udtLocatorPlugin(): Plugin {
  return {
    name: 'u-devtools:locator',
    apply: 'serve', // Only run in Dev mode
    enforce: 'pre', // Run before other transforms
    transform(code, id) {
      // 1. Filter files
      if (id.includes('node_modules') || !TARGET_RE.test(id)) return;

      // Skip if already processed
      if (code.includes('data-udt-loc=')) return;

      const s = new MagicString(code);
      
      // Regex to find potential start of tags
      const tagRegex = /<([a-zA-Z0-9-:]+)/g;

      let match: RegExpExecArray | null;
      match = tagRegex.exec(code);
      while (match !== null) {
        const tagName = match[1];
        const index = match.index;

        // --- SAFETY CHECKS ---

        // 1. Generic/Math Check:
        // If the '<' is preceded by a word character (a-z, 0-9, _, $), it is likely:
        // - A TypeScript Generic: ref<T>, Array<String>, Record<K, V>
        // - A comparison: if (a<b)
        // JSX/HTML tags are usually preceded by whitespace, '(', '[', '=', or return.
        if (index > 0 && /[\w$]/.test(code[index - 1])) {
          match = tagRegex.exec(code);
          continue;
        }

        // 2. Ignore reserved/structural tags
        if (['template', 'script', 'style', 'slot', 'Fragment', 'React.Fragment', 'html', 'head', 'body'].includes(tagName)) {
          match = tagRegex.exec(code);
          continue;
        }

        // 3. ✨ NEW: Ignore Vue Components (PascalCase) ✨
        // Standard HTML tags always start with lowercase.
        // Components usually start with Uppercase (UButton, GlobalDialogs).
        // Exception: kebab-case components (u-button), but those usually handle attrs fine unless they are fragments.
        // We will strictly target HTML elements to be safe and avoid Vue warnings.
        const isHtmlTag = /^[a-z][a-z0-9-]*$/.test(tagName);
        
        // If it's not a standard HTML tag, skip it to prevent "Extraneous non-props attributes" warning
        // This means we won't be able to "inspect" the component root itself, 
        // but we can inspect the HTML elements INSIDE it, which is usually what we want for Tailwind editing.
        if (!isHtmlTag) {
          match = tagRegex.exec(code);
          continue;
        }

        // 4. Calculate line number (1-based)
        const line = code.substring(0, index).split('\n').length;

        // 5. Inject attribute
        // <div ...  ->  <div data-udt-loc="filepath:line" ...
        s.appendLeft(index + 1 + tagName.length, ` data-udt-loc="${id}:${line}"`);
        
        match = tagRegex.exec(code);
      }

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        };
      }

      return null;
    },
  };
}
