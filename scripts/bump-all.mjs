#!/usr/bin/env node

/**
 * Bump version for all packages and plugins
 * Usage:
 *   node scripts/bump-all.mjs [patch|minor|major]
 *   node scripts/bump-all.mjs --type patch
 *   node scripts/bump-all.mjs -t minor
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Increment version based on type
function bumpVersion(version, type) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }

  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);
  const patch = parseInt(parts[2], 10);

  switch (type) {
    case 'major':
      // 0.1.6 -> 1.0.0
      return `${major + 1}.0.0`;
    case 'minor':
      // 0.1.6 -> 0.2.0
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      // 0.1.6 -> 0.1.7
      return `${major}.${minor}.${patch + 1}`;
  }
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
function main(bumpType) {
  const typeLabels = {
    major: 'major (+1.0.0)',
    minor: 'minor (+0.1.0)',
    patch: 'patch (+0.0.1)',
  };

  if (!typeLabels[bumpType]) {
    console.error(`❌ Invalid bump type: ${bumpType}`);
    console.error(`   Valid types: patch, minor, major`);
    process.exit(1);
  }

  console.log(`📦 Bumping ${typeLabels[bumpType]} version for all packages and plugins...\n`);

  const packages = getPackages();
  const updated = [];

  for (const pkg of packages) {
    try {
      const pkgContent = JSON.parse(readFileSync(pkg.path, 'utf-8'));
      const oldVersion = pkgContent.version;
      const newVersion = bumpVersion(oldVersion, bumpType);

      pkgContent.version = newVersion;

      // Also update publishConfig.version if it exists
      if (pkgContent.publishConfig?.version) {
        pkgContent.publishConfig.version = newVersion;
      }

      writeFileSync(pkg.path, `${JSON.stringify(pkgContent, null, 2)}\n`, 'utf-8');
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

// Setup commander
const program = new Command();

program
  .name('bump-all')
  .description('Bump version for all packages and plugins')
  .version('1.0.0')
  .option('-t, --type <type>', 'Version bump type (patch, minor, major)', 'patch')
  .argument('[type]', 'Version bump type (patch, minor, major)')
  .action((argType, options) => {
    // Priority: argument > option > default
    const bumpType = argType || options.type || 'patch';
    main(bumpType);
  });

program.parse();
