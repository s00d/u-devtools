---
to: <%= name %>/src/index.ts
---
// Export your package API here
export function hello() {
  return 'Hello from <%= packageName || `@u-devtools/${name}` %>!';
}

