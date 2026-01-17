---
to: <%= projectName %>/tsconfig.json
---
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "types": ["node", "svelte"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

