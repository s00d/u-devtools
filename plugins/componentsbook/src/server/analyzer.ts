import { parse as docgenParse } from 'vue-docgen-api';
import type { FileSystemService } from '@u-devtools/utils-node';
import path from 'node:path';
import type { ComponentMeta, PropMeta, EventMeta, SlotMeta } from '../types';

/**
 * Analyzes a component file to extract metadata
 * Supports Vue (via vue-docgen-api), React/Svelte (basic support)
 * @param filePath - Absolute path to component file
 * @param fs - FileSystemService instance (optional, for React/Svelte fallback)
 * @param root - Project root directory (required if fs is provided)
 */
export async function analyzeComponent(filePath: string, fs?: FileSystemService, root?: string): Promise<ComponentMeta> {
  const isVue = filePath.endsWith('.vue');
  
  // 1. Vue (vue-docgen-api)
  if (isVue) {
    try {
      const doc = await docgenParse(filePath);

      // Extract props with full information
      const propsData: PropMeta[] =
        doc.props?.map((prop) => {
          let values: string[] | undefined;
          if (prop.values && Array.isArray(prop.values)) {
            values = prop.values;
          } else if (prop.type?.name) {
            if (prop.type.name === 'union' && 'elements' in prop.type) {
              values = (prop.type.elements as { name: string }[])
                .map((el) => el.name)
                .filter(Boolean);
            }
          }

          return {
            name: prop.name,
            type: (prop.type?.name || 'any').replace('() => ', ''),
            required: prop.required || false,
            default: prop.defaultValue?.value,
            description: prop.description,
            values,
          };
        }) ?? [];

      // Extract events with descriptions
      const eventsData: EventMeta[] =
        doc.events?.map((event) => ({
          name: event.name,
          description: event.description || '',
        })) ?? [];

      // Extract slots with descriptions and bindings
      const slotsData: SlotMeta[] =
        doc.slots?.map((slot) => {
          let bindings: string | undefined;
          if (slot.bindings && Object.keys(slot.bindings).length > 0) {
            bindings = Object.entries(slot.bindings)
              .map(([bindingName, bindingType]) => `${bindingName}: ${bindingType}`)
              .join(', ');
          }

          return {
            name: slot.name,
            description: slot.description,
            bindings,
          };
        }) ?? [];

      return {
        props: propsData,
        events: eventsData,
        slots: slotsData,
      };
    } catch (e) {
      console.warn(`[componentsbook] Vue docgen failed for ${filePath}`, e);
      return { props: [], events: [], slots: [] };
    }
  }

  // 2. React / Svelte (Simple Regex Fallback)
  // Это временное решение, чтобы UI не был пустым. 
  // В идеале нужно подключить react-docgen для .tsx
  if (!fs || !root) {
    return { props: [], events: [], slots: [] };
  }
  
  try {
      // filePath is absolute, need to convert to relative for FileSystemService
      const relativePath = path.relative(root, filePath);
      const content = await fs.read(relativePath);
      const props: PropMeta[] = [];
      
      // Simple TS interface matcher for React props: interface Props { ... }
      const interfaceMatch = content.match(/interface\s+\w*Props\s*{([^}]*)}/);
      if (interfaceMatch) {
          const body = interfaceMatch[1];
          const lines = body.split('\n');
          lines.forEach(line => {
              const propMatch = line.match(/^\s*(\w+)(\??):\s*([^;]+)/);
              if (propMatch) {
                  props.push({
                      name: propMatch[1],
                      required: propMatch[2] !== '?',
                      type: propMatch[3].trim(),
                      description: 'Detected from TS interface'
                  });
              }
          });
      }

      return { props, events: [], slots: [] };
  } catch {
      return { props: [], events: [], slots: [] };
  }
}

