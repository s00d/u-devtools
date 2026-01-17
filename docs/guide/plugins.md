# Plugins

Universal DevTools Kit comes with a collection of built-in plugins that provide various debugging and development tools. This page lists all available plugins with their descriptions and features.

## Available Plugins

### Core Plugins

#### @u-devtools/plugin-console
**Description:** Console logger plugin for Universal DevTools. Captures and displays console messages from your application.

**Features:**
- Real-time console message capture
- Filter by log level (log, warn, error, info)
- Clear console functionality
- Export logs

**Documentation:** [API Reference](/api/@u-devtools/plugin-console/README)

---

#### @u-devtools/plugin-network
**Description:** Network logger plugin for Universal DevTools. Intercepts and logs all fetch/XHR requests with detailed information.

**Features:**
- Request/response interception
- Request composer for testing APIs
- Mock rules for development
- cURL export
- Request timing and status codes

**Documentation:** [API Reference](/api/@u-devtools/plugin-network/README)

---

#### @u-devtools/plugin-inspector
**Description:** Element inspector plugin for Universal DevTools. Allows selecting elements on the page and inspecting their properties.

**Features:**
- Element selection on hover
- DOM tree navigation
- Element properties inspection
- CSS styles viewer
- Computed styles display

**Documentation:** [API Reference](/api/@u-devtools/plugin-inspector/README)

---

#### @u-devtools/plugin-storage
**Description:** Storage Manager plugin for viewing and editing LocalStorage, SessionStorage, and Cookies.

**Features:**
- View and edit LocalStorage
- View and edit SessionStorage
- Cookie management
- IndexedDB browser
- OPFS (Origin Private File System) support
- Real-time updates

**Documentation:** [API Reference](/api/@u-devtools/plugin-storage/README)

---

#### @u-devtools/plugin-terminal
**Description:** Terminal plugin for running npm scripts from DevTools.

**Features:**
- Full terminal emulation
- Run npm/pnpm/yarn commands
- Execute shell commands
- Command history
- Output streaming

**Documentation:** [API Reference](/api/@u-devtools/plugin-terminal/README)

---

### Framework-Specific Plugins

#### @u-devtools/plugin-vue-inspector
**Description:** Vue Inspector plugin for Universal DevTools. Inspects Vue component tree, props, state, and routes.

**Features:**
- Vue component tree navigation
- Component props inspection
- Reactive state inspection
- Vue Router integration
- Component overlay highlighting

**Documentation:** [API Reference](/api/@u-devtools/plugin-vue-inspector/README)

---

### Development Tools

#### @u-devtools/plugin-i18n
**Description:** i18n plugin for Universal DevTools. Visual editor for translation files with live preview.

**Features:**
- File tree navigation
- Translation key editing
- Live preview
- JSON validation
- Multi-language support

**Documentation:** [API Reference](/api/@u-devtools/plugin-i18n/README)

---

#### @u-devtools/plugin-package-inspector
**Description:** Package Inspector plugin for viewing dependencies from package.json.

**Features:**
- Dependency tree visualization
- Version information
- Package details
- Dependency search
- Update suggestions

**Documentation:** [API Reference](/api/@u-devtools/plugin-package-inspector/README)

---

#### @u-devtools/plugin-vite-inspector
**Description:** Vite Inspector plugin for Universal DevTools - deep dive into Vite configuration and server.

**Features:**
- Vite config inspection
- Module graph visualization
- Server status monitoring
- Plugin list
- Build information

**Documentation:** [API Reference](/api/@u-devtools/plugin-vite-inspector/README)

---

### Advanced Plugins

#### @u-devtools/plugin-componentsbook
**Description:** Component storybook plugin for Universal DevTools - Interactive component development and documentation.

**Features:**
- Component catalog
- Interactive prop editing
- Live component preview
- Documentation generation
- Multi-framework support (Vue, React, Svelte, Solid)

**Documentation:** [API Reference](/api/@u-devtools/plugin-componentsbook/README)

---

#### @u-devtools/plugin-manager
**Description:** Plugin Manager for Universal DevTools. Manage installed plugins and discover new ones.

**Features:**
- Installed plugins list
- Plugin marketplace
- Install/uninstall plugins
- Plugin configuration
- Plugin search

**Documentation:** [API Reference](/api/@u-devtools/plugin-manager/README)

---

#### @u-devtools/plugin-library
**Description:** UI Library - Component snippets and drag-and-drop inserter.

**Features:**
- Component library browser
- Code snippets
- Drag-and-drop insertion
- Component search
- Category filtering

**Documentation:** [API Reference](/api/@u-devtools/plugin-library/README)

---

#### @u-devtools/plugin-seo
**Description:** SEO Studio plugin for Universal DevTools.

**Features:**
- Meta tags analysis
- Social preview generation
- Structured data validation
- Content analysis
- SEO score calculation

**Documentation:** [API Reference](/api/@u-devtools/plugin-seo/README)

---

#### @u-devtools/plugin-security
**Description:** Security Auditor plugin for Universal DevTools.

**Features:**
- Security vulnerability scanning
- Dependency audit
- Security best practices
- Risk assessment

**Documentation:** [API Reference](/api/@u-devtools/plugin-security/README)

---

#### @u-devtools/plugin-tailwind
**Description:** Tailwind Commander - Ultimate IDE for Tailwind CSS styles.

**Features:**
- Tailwind class builder
- Style inspector
- Design system integration
- CSS generation

**Documentation:** [API Reference](/api/@u-devtools/plugin-tailwind/README)

---

#### @u-devtools/plugin-repo2txt
**Description:** repo2txt plugin for converting repository structure to text format.

**Features:**
- Repository structure analysis
- File tree generation
- Export to markdown
- Token limit management

**Documentation:** [API Reference](/api/@u-devtools/plugin-repo2txt/README)

---

#### @u-devtools/plugin-remote-control
**Description:** Remote Control plugin - DOM Mirroring.

**Features:**
- Remote DOM inspection
- Cross-window communication
- Element synchronization

**Documentation:** [API Reference](/api/@u-devtools/plugin-remote-control/README)

---

## Installing Plugins

To use a plugin, install it as a dev dependency:

```bash
pnpm add -D @u-devtools/plugin-<name>
```

Then add it to your `vite.config.ts`:

```typescript
import { createDevTools } from '@u-devtools/vite';
import { plugin as consolePlugin } from '@u-devtools/plugin-console';

export default defineConfig({
  plugins: [
    createDevTools({
      plugins: [
        consolePlugin(),
        // ... other plugins
      ],
    }),
  ],
});
```

## Creating Custom Plugins

You can create your own plugins using the plugin generator:

```bash
pnpm create:plugin
```

Or see the [Plugin Development Guide](/guide/plugin-development) for detailed instructions.
