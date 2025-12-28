# Contributing to Universal DevTools Kit

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 8+
- Git

### Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/u-devtools.git
   cd u-devtools
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Build all packages**
   ```bash
   pnpm build
   ```

5. **Run the playground**
   ```bash
   cd playground
   pnpm dev
   ```

## Development Workflow

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Run tests:
   ```bash
   pnpm test
   ```

4. Run type checking:
   ```bash
   pnpm typecheck
   ```

5. Run linting:
   ```bash
   pnpm lint
   ```

6. Format code:
   ```bash
   pnpm format
   ```

### Creating a Plugin

See the [Plugin Development Guide](../README.md#-plugin-development-guide) in the main README.

### Testing

We use Vitest for testing. Tests are located in `packages/*/test/` directories.

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

## Submitting Changes

1. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

2. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

3. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit

## Code Style

- We use Biome for formatting and linting
- TypeScript strict mode is enabled
- Follow the existing code style
- Use meaningful variable and function names

## Project Structure

```
u-devtools/
├── packages/
│   ├── core/          # Core types and utilities
│   ├── bridge/        # RPC communication
│   ├── vite/          # Vite plugin
│   ├── client/        # DevTools Shell UI
│   └── ui/            # UI component library
├── plugins/
│   ├── i18n/          # i18n plugin
│   ├── network/       # Network plugin
│   └── inspector/     # Inspector plugin
└── playground/        # Test application
```

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

