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
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "pnpm build"
  },
  "keywords": [
    "u-devtools-plugin",
    "devtools",
    "react"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "latest",
    "@u-devtools/kit": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.19.27",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.0",
    "vite-plugin-dts": "^4.5.4"
  }
}

