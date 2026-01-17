import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'
import pkg from '../../package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Universal DevTools Kit',
  description: 'Framework-agnostic DevTools Kit for building custom debugging tools',
  lastUpdated: true,
  cleanUrls: true,
  base: process.env.NODE_ENV === 'production' ? '/u-devtools/' : '/',
  ignoreDeadLinks: [
    /^\.\/_media\//,
    /^\.\/LICENSE$/
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  themeConfig: {
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'Plugin Development', link: '/guide/plugin-development' },
          { text: 'UI Components', link: '/guide/components' },
          { text: 'Plugins', link: '/guide/plugins' },
          { text: 'Packages', link: '/guide/packages' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Overview', link: '/api/README' },
          { text: 'Packages', link: '/api/packages' },
          { text: '@u-devtools/core', link: '/api/@u-devtools/core/README' },
          { text: '@u-devtools/kit', link: '/api/@u-devtools/kit/README' },
          { text: '@u-devtools/bridge', link: '/api/@u-devtools/bridge/README' },
          { text: '@u-devtools/utils', link: '/api/@u-devtools/utils/README' },
          { text: '@u-devtools/utils-node', link: '/api/@u-devtools/utils-node/README' },
          { text: '@u-devtools/vite', link: '/api/@u-devtools/vite/README' },
          { text: '@u-devtools/ui', link: '/api/@u-devtools/ui/README' },
          { text: '@u-devtools/client', link: '/api/@u-devtools/client/README' },
          { text: '@u-devtools/overlay', link: '/api/@u-devtools/overlay/README' },
          { text: '@u-devtools/electron', link: '/api/@u-devtools/electron/README' },
        ],
      },
      {
        text: 'Plugins',
        items: [
          { text: '@u-devtools/plugin-i18n', link: '/api/@u-devtools/plugin-i18n/README' },
          { text: '@u-devtools/plugin-console', link: '/api/@u-devtools/plugin-console/README' },
          { text: '@u-devtools/plugin-network', link: '/api/@u-devtools/plugin-network/README' },
          { text: '@u-devtools/plugin-inspector', link: '/api/@u-devtools/plugin-inspector/README' },
          { text: '@u-devtools/plugin-storage', link: '/api/@u-devtools/plugin-storage/README' },
          { text: '@u-devtools/plugin-terminal', link: '/api/@u-devtools/plugin-terminal/README' },
          { text: '@u-devtools/plugin-vue-inspector', link: '/api/@u-devtools/plugin-vue-inspector/README' },
          { text: '@u-devtools/plugin-vite-inspector', link: '/api/@u-devtools/plugin-vite-inspector/README' },
          { text: '@u-devtools/plugin-package-inspector', link: '/api/@u-devtools/plugin-package-inspector/README' },
        ],
      },
      { text: 'Examples', link: '/examples/' },
      {
        text: pkg.version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/s00d/u-devtools/blob/main/CHANGELOG.md',
          },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/s00d/u-devtools/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Universal DevTools Kit',
    },

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Plugin Development', link: '/guide/plugin-development' },
            { text: 'UI Components', link: '/guide/components' },
            { text: 'Plugins', link: '/guide/plugins' },
            { text: 'Packages', link: '/guide/packages' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Overview', link: '/api/README' },
            { text: 'Packages', link: '/api/packages' },
            { text: '@u-devtools/core', link: '/api/@u-devtools/core/README' },
            { text: '@u-devtools/kit', link: '/api/@u-devtools/kit/README' },
            { text: '@u-devtools/bridge', link: '/api/@u-devtools/bridge/README' },
            { text: '@u-devtools/utils', link: '/api/@u-devtools/utils/README' },
            { text: '@u-devtools/utils-node', link: '/api/@u-devtools/utils-node/README' },
            { text: '@u-devtools/vite', link: '/api/@u-devtools/vite/README' },
            { text: '@u-devtools/ui', link: '/api/@u-devtools/ui/README' },
            { text: '@u-devtools/client', link: '/api/@u-devtools/client/README' },
            { text: '@u-devtools/overlay', link: '/api/@u-devtools/overlay/README' },
            { text: '@u-devtools/electron', link: '/api/@u-devtools/electron/README' },
          ],
        },
        {
          text: 'Plugins',
          items: [
            { text: '@u-devtools/plugin-i18n', link: '/api/@u-devtools/plugin-i18n/README' },
            { text: '@u-devtools/plugin-console', link: '/api/@u-devtools/plugin-console/README' },
            { text: '@u-devtools/plugin-network', link: '/api/@u-devtools/plugin-network/README' },
            { text: '@u-devtools/plugin-inspector', link: '/api/@u-devtools/plugin-inspector/README' },
            { text: '@u-devtools/plugin-storage', link: '/api/@u-devtools/plugin-storage/README' },
            { text: '@u-devtools/plugin-terminal', link: '/api/@u-devtools/plugin-terminal/README' },
            { text: '@u-devtools/plugin-vue-inspector', link: '/api/@u-devtools/plugin-vue-inspector/README' },
            { text: '@u-devtools/plugin-vite-inspector', link: '/api/@u-devtools/plugin-vite-inspector/README' },
            { text: '@u-devtools/plugin-package-inspector', link: '/api/@u-devtools/plugin-package-inspector/README' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s00d/u-devtools' },
    ],
  },
})
