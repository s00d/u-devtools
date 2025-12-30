---
to: <%= projectName %>/package.json
---
{
  "name": "<%= packageName %>",
  "version": "0.0.0",
  "description": "<%= description %>",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "type": "module",
  "files": [
    "dist",
    "src",
    "README.md"
  ],
  "publishConfig": {
    "access": "public",
    "main": "./dist/index.js",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js"
      },
      "./package.json": "./package.json"
    }
  },
  "scripts": {
    "build": "vite build",
    "typecheck": "svelte-check --tsconfig ./tsconfig.json",
    "prepublishOnly": "pnpm build"
  },
  "keywords": [
    "u-devtools-plugin",
    "devtools",
    "svelte"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "latest",
    "@u-devtools/kit": "latest",
    "svelte": "^5.46.1"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^6.2.1",
    "@types/node": "^20.19.27",
    "svelte-check": "^4.3.5",
    "typescript": "^5.9.3",
    "vite": "^7.3.0",
    "vite-plugin-dts": "^4.5.4"
  }
}

