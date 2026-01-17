import { execSync } from 'child_process';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ext = process.platform === 'win32' ? '.exe' : '';

let targetTriple;
try {
  // Try new Rust 1.84.0+ method first
  targetTriple = execSync('rustc --print host-tuple', { encoding: 'utf-8' }).trim();
} catch (e) {
  try {
    // Fallback to older method
    const rustInfo = execSync('rustc -vV', { encoding: 'utf-8' });
    const match = /host: (\S+)/.exec(rustInfo);
    if (match) {
      targetTriple = match[1];
    } else {
      throw new Error('Could not determine target triple');
    }
  } catch (e2) {
    console.error('Failed to determine platform target triple');
    process.exit(1);
  }
}

if (!targetTriple) {
  console.error('Failed to determine platform target triple');
  process.exit(1);
}

// Create binaries directory if it doesn't exist
const binariesDir = join(__dirname, '../binaries');
if (!fs.existsSync(binariesDir)) {
  fs.mkdirSync(binariesDir, { recursive: true });
}

// pkg creates files with platform-specific names when using --output with multiple targets
// Format: my-sidecar-<platform>-<arch> or my-sidecar-<platform>-<arch>.exe
// We need to find and rename all created binaries to Tauri format: my-sidecar-<target-triple>

// Map of pkg platform/arch combinations to Rust target triples
const pkgToRustTarget = {
  'linux-x64': 'x86_64-unknown-linux-gnu',
  'linux-arm64': 'aarch64-unknown-linux-gnu',
  'macos-x64': 'x86_64-apple-darwin',
  'macos-arm64': 'aarch64-apple-darwin',
  'win-x64': 'x86_64-pc-windows-msvc',
  'win-arm64': 'aarch64-pc-windows-msvc',
  'alpine-x64': 'x86_64-unknown-linux-musl',
  'alpine-arm64': 'aarch64-unknown-linux-musl',
};

// pkg creates files with format: <package-name>-<platform>-<arch> or <package-name>-<platform>-<arch>.exe
// Package name is "plugin-server-sidecar", so files are like: plugin-server-sidecar-linux-x64, etc.
const files = fs.readdirSync(__dirname);
let foundAny = false;

for (const file of files) {
  // Skip if already in binaries directory or not a binary
  if (file.includes('x86_64') || file.includes('aarch64') || file === 'rename.js' || file === 'index.js' || file === 'package.json' || file === 'build.js' || file === 'dist' || file.startsWith('.')) continue;
  
  // Check if it's a pkg output file (starts with 'plugin-server-sidecar' or 'index')
  const isPkgOutput = file.startsWith('plugin-server-sidecar') || file.startsWith('index');
  if (!isPkgOutput) continue;
  
  // Determine target from filename
  let rustTarget = null;
  let ext = '';
  
  if (file.endsWith('.exe')) {
    ext = '.exe';
    const base = file.replace('.exe', '');
    if (base.includes('win-x64') || base.includes('win64')) {
      rustTarget = 'x86_64-pc-windows-msvc';
    } else if (base.includes('win-arm64') || base.includes('win-arm')) {
      rustTarget = 'aarch64-pc-windows-msvc';
    } else if (base === 'index' || base === 'my-sidecar') {
      // Default Windows (current platform)
      rustTarget = 'x86_64-pc-windows-msvc';
    }
  } else {
    // pkg creates files like: plugin-server-sidecar-linux-x64, plugin-server-sidecar-macos-arm64, etc.
    // or index-linux-x64, index-macos-arm64, etc.
    if (file.includes('linux-x64')) {
      rustTarget = 'x86_64-unknown-linux-gnu';
    } else if (file.includes('linux-arm64')) {
      rustTarget = 'aarch64-unknown-linux-gnu';
    } else if (file.includes('macos-x64')) {
      rustTarget = 'x86_64-apple-darwin';
    } else if (file.includes('macos-arm64')) {
      rustTarget = 'aarch64-apple-darwin';
    } else if (file.includes('alpine-x64')) {
      rustTarget = 'x86_64-unknown-linux-musl';
    } else if (file.includes('alpine-arm64')) {
      rustTarget = 'aarch64-unknown-linux-musl';
    }
  }
  
  if (rustTarget) {
    const targetFile = join(binariesDir, `my-sidecar-${rustTarget}${ext}`);
    fs.renameSync(file, targetFile);
    console.log(`Renamed ${file} to ${targetFile}`);
    foundAny = true;
  }
}

if (!foundAny) {
  console.error('No sidecar binaries found to rename');
  console.error('Files in directory:', files.filter(f => f.startsWith('plugin-server-sidecar') || f.startsWith('index')));
  process.exit(1);
}
