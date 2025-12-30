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
    "src"
  ],
  "scripts": {
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@u-devtools/core": "latest",
    "@u-devtools/ui": "latest",
    "@u-devtools/kit": "latest",
    "vue": "^3.5.26"
  },
  "devDependencies": {
    "@types/node": "^20.19.27",
    "typescript": "^5.9.3"
  }
}

