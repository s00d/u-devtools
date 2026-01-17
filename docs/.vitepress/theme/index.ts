import { h, nextTick, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { useData } from 'vitepress'
import { createMermaidRenderer } from 'vitepress-mermaid-renderer'
import * as UI from '@u-devtools/ui'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData()

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        theme: isDark.value ? 'dark' : 'forest',
        startOnLoad: true,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
        },
      })

      // Customize toolbar
      mermaidRenderer.setToolbar({
        showLanguageLabel: true,
        downloadFormat: 'svg',
        desktop: {
          zoomIn: 'enabled',
          zoomOut: 'enabled',
          resetView: 'enabled',
          copyCode: 'enabled',
          download: 'enabled',
          toggleFullscreen: 'enabled',
          zoomLevel: 'enabled',
          positions: { vertical: 'bottom', horizontal: 'right' },
        },
        mobile: {
          zoomIn: 'disabled',
          zoomOut: 'disabled',
          resetView: 'enabled',
          copyCode: 'enabled',
          download: 'disabled',
          toggleFullscreen: 'enabled',
          zoomLevel: 'disabled',
          positions: { vertical: 'bottom', horizontal: 'left' },
        },
        fullscreen: {
          zoomIn: 'enabled',
          zoomOut: 'enabled',
          resetView: 'enabled',
          copyCode: 'enabled',
          download: 'enabled',
          toggleFullscreen: 'enabled',
          zoomLevel: 'enabled',
          positions: { vertical: 'top', horizontal: 'right' },
        },
      })
    }

    // Initial mermaid setup
    nextTick(() => initMermaid())

    // On theme change, re-render mermaid charts
    watch(
      () => isDark.value,
      () => {
        initMermaid()
      },
    )

    return h(DefaultTheme.Layout)
  },
  enhanceApp({ app }) {
    // Register all UI components globally for use in markdown files
    // This allows Live Demo examples in JSDoc to render as actual Vue components
    Object.entries(UI).forEach(([name, component]) => {
      // Check if it's a component (starts with U and is an object)
      if (name.startsWith('U') && typeof component === 'object' && component !== null) {
        app.component(name, component)
      }
    })
  },
} satisfies Theme
