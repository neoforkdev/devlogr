# Contributing to DevLogr

Thank you for your interest in contributing to DevLogr! This guide will help you get started with the development workflow.

## Development Setup

### Prerequisites

- Node.js 16.0.0 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/neoforkdev/devlogr.git
   cd devlogr
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Pre-commit Hooks

This project uses automated pre-commit hooks to ensure code quality:

#### **Pre-commit Hook**

- Runs **Prettier** to format code
- Runs **ESLint** to check for linting issues
- Only processes staged files (via `lint-staged`)

#### **Commit Message Hook**

- Enforces **Conventional Commits** format
- Required format: `type(scope): description`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

#### **Pre-push Hook**

- Runs full test suite before pushing
- Prevents pushing if tests fail

### Available Scripts

```bash
# Development
npm run build              # Compile TypeScript
npm run build:watch        # Watch mode compilation
npm test                   # Run tests
npm test:watch             # Watch mode testing
npm test:coverage          # Run tests with coverage

# Code Quality
npm run lint               # Check linting issues
npm run lint:fix           # Fix linting issues automatically
npm run format             # Check code formatting
npm run format:fix         # Fix formatting automatically
npm run check              # Run format + lint + build + test
npm run fix                # Run format:fix + lint:fix

# Pre-commit (automatically run by hooks)
npm run pre-commit         # Run lint-staged

# Examples
npm run example:env-variables    # Interactive environment demo
npm run example:demo             # General demo
# ... other example scripts

# Documentation
npm run docs               # Generate documentation
npm run docs:serve         # Serve documentation locally
```

## Code Style Guidelines

### TypeScript

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons**
- Use **trailing commas** where valid
- Maximum line length: **100 characters**

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Features
feat: add new logging feature
feat(spinner): add color customization

# Bug fixes
fix: resolve memory leak in logger
fix(json): handle circular references correctly

# Documentation
docs: update README with examples
docs(api): add JSDoc comments

# Tests
test: add unit tests for formatters
test(integration): add end-to-end tests

# Refactoring
refactor: simplify theme provider logic
refactor(utils): extract common string utilities

# Chores
chore: update dependencies
chore(ci): update GitHub Actions workflow
```

### File Organization

```
src/
├── types.ts           # Type definitions
├── config.ts          # Configuration management
├── logger.ts          # Main logger implementation
├── themes.ts          # Theme and styling
├── formatters.ts      # Message formatting
├── devlogr-renderer.ts # Custom Listr2 renderer
└── utils/             # Utility modules
    ├── terminal.ts    # Terminal detection
    ├── string.ts      # String utilities
    ├── emoji.ts       # Emoji handling
    └── spinner.ts     # Spinner utilities
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Specific categories
npm run test:core      # Core functionality
npm run test:format    # Formatting tests
npm run test:spinner   # Spinner tests
npm run test:utils     # Utility tests
npm run test:config    # Configuration tests

# Coverage
npm run test:coverage
```

### Writing Tests

- Use **Vitest** as the testing framework
- Place tests in the `tests/` directory
- Follow the existing test structure
- Write descriptive test names
- Include both unit and integration tests

### Test Categories

- **Core**: Basic logging functionality
- **Format**: Message formatting and themes
- **Spinner**: Spinner and task management
- **Utils**: Utility functions
- **Config**: Configuration and environment variables

### Demo Testing

DevLogr includes comprehensive demo testing in CI to ensure examples work correctly across different environments:

#### **Automated Demo Testing**

- **GitHub Action**: `.github/workflows/demo-test.yml` runs all example scripts
- **CI Integration**: Main CI workflow includes a quick demo smoke test
- **Environment Testing**: Validates demos work with various configurations:
  - `NO_COLOR=1` - Accessibility mode
  - `DEVLOGR_NO_ICONS=true` - Icon-free environments
  - `DEVLOGR_JSON=true` - Structured logging mode
  - `DEVLOGR_LOG_LEVEL=debug` - Verbose output

#### **Manual Demo Testing**

```bash
# Test individual examples
npm run example:demo             # Main demo
npm run example:levels           # Logging levels
npm run example:single-spinner   # Basic spinner
npm run example:multiple-spinners # Advanced spinners
npm run example:colored-spinners # Spinner colors
npm run example:env-variables    # Environment config
npm run example:json-output      # JSON mode
npm run example:safe-string-utils # String utilities

# Test with different environments
NO_COLOR=1 npm run example:demo
DEVLOGR_NO_ICONS=true npm run example:demo
DEVLOGR_JSON=true npm run example:demo
```

#### **Adding New Examples**

When adding new examples:

1. Add the example script to `examples/` directory
2. Add npm script to `package.json`
3. Update the demo test workflow if needed
4. Test manually with different environment configurations
5. Ensure examples work in CI environments (non-TTY)

## Environment Variables

Test your changes with different environment configurations:

```bash
# Test icon visibility
DEVLOGR_NO_ICONS=true npm run example:demo

# Test JSON output
DEVLOGR_OUTPUT_JSON=true npm run example:demo

# Test log levels
DEVLOGR_LOG_LEVEL=debug npm run example:demo

# Test timestamps and prefixes
DEVLOGR_SHOW_TIMESTAMP=true DEVLOGR_SHOW_PREFIX=true npm run example:demo
```

## Documentation

- Update **README.md** for user-facing changes
- Add **JSDoc comments** for new public APIs
- Update **examples** when adding new features
- Run `npm run docs` to generate API documentation

## Troubleshooting

### Pre-commit Hooks Not Running

```bash
# Reinstall hooks
npx husky install
```

### Formatting Issues

```bash
# Fix all formatting issues
npm run fix
```

### Test Failures

```bash
# Run specific test file
npx vitest tests/core/logger.test.ts

# Run with verbose output
npm test -- --reporter=verbose
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-new-feature`
3. **Make** your changes following the guidelines above
4. **Test** your changes: `npm run check`
5. **Commit** using conventional commits format
6. **Push** to your fork: `git push origin feat/my-new-feature`
7. **Create** a Pull Request

### Pull Request Checklist

- [ ] Code follows the style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/neoforkdev/devlogr/issues)
- **Discussions**: [GitHub Discussions](https://github.com/neoforkdev/devlogr/discussions)
- **Documentation**: [API Docs](https://neoforkdev.github.io/devlogr/)

Thank you for contributing to DevLogr! 🚀
