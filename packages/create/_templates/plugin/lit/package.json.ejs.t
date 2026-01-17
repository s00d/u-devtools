---
to: <%= projectName %>/package.json
---
{
  "name": "<%= packageName %>",
  "version": "0.0.0",
  "description": "<%= description %>",
  "main": "./dist/index.cjs.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "main": "./dist/index.cjs.js",
    "module": "./dist/index.es.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.es.js",
        "require": "./dist/index.cjs.js"
      },
      "./client": {
        "import": "./dist/client.js"
      },
      "./package.json": "./package.json"
    }
  },
  "scripts": {
    "build": "vite build && vite build -c vite.config.standalone.ts",
    "build:standalone": "vite build -c vite.config.standalone.ts",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "keywords": [
    "u-devtools-plugin",
    "devtools",
    "lit",
    "web-components"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/s00d/u-devtools.git",
    "directory": "plugins/<%= projectName %>"
  },
  "dependencies": {
    "@u-devtools/core": "latest",
    "@u-devtools/overlay": "latest",
    "@u-devtools/ui": "latest",
    "@u-devtools/utils": "latest",
    "@u-devtools/kit": "latest",
    "lit": "^3.1.2"
  },
  "devDependencies": {
    "@types/node": "^20.19.27",
    "typescript": "^5.9.3",
    "vite": "^7.3.0",
    "vite-plugin-dts": "^4.5.4"
  }
}
