#!/usr/bin/env node

/**
 * Bump patch version (+0.0.1) for all packages and plugins
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Increment patch version
function bumpVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  const patch = parseInt(parts[2], 10) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

// Get all packages and plugins
function getPackages() {
  const packages = [];

  // Get packages
  const packagesDir = join(rootDir, 'packages');
  if (existsSync(packagesDir)) {
    const dirs = readdirSync(packagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const dir of dirs) {
      const pkgPath = join(packagesDir, dir, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (!pkg.private && pkg.name && pkg.version) {
          packages.push({
            name: pkg.name,
            path: pkgPath,
            version: pkg.version,
          });
        }
      }
    }
  }

  // Get plugins
  const pluginsDir = join(rootDir, 'plugins');
  if (existsSync(pluginsDir)) {
    const dirs = readdirSync(pluginsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const dir of dirs) {
      const pkgPath = join(pluginsDir, dir, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        if (!pkg.private && pkg.name && pkg.version) {
          packages.push({
            name: pkg.name,
            path: pkgPath,
            version: pkg.version,
          });
        }
      }
    }
  }

  return packages;
}

// Main function
function main() {
  console.log('📦 Bumping patch version (+0.0.1) for all packages and plugins...\n');

  const packages = getPackages();
  const updated = [];

  for (const pkg of packages) {
    try {
      const pkgContent = JSON.parse(readFileSync(pkg.path, 'utf-8'));
      const oldVersion = pkgContent.version;
      const newVersion = bumpVersion(oldVersion);

      pkgContent.version = newVersion;

      // Also update publishConfig.version if it exists
      if (pkgContent.publishConfig?.version) {
        pkgContent.publishConfig.version = newVersion;
      }

      writeFileSync(pkg.path, `${JSON.stringify(pkgContent, null, 2)}`, 'utf-8');
      updated.push({ name: pkg.name, old: oldVersion, new: newVersion });
      console.log(`  ✓ ${pkg.name}: ${oldVersion} → ${newVersion}`);
    } catch (error) {
      console.error(`  ✗ ${pkg.name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Updated ${updated.length} package(s)\n`);

  if (updated.length > 0) {
    console.log('💡 Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Commit: git add . && git commit -m "chore: bump versions"');
    console.log('   3. Publish: pnpm release');
  }
}

main();
