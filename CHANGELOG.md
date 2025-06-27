# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2025-06-25

### Added

- Centralized `ChalkUtils` utility for consistent color management across all components
- Smart color override logic that bypasses Chalk's conservative CI detection
- Initialization safety with fallback handling for module loading edge cases
- Enhanced error handling for LogConfiguration availability during static initialization

### Improved

- **MAJOR**: All chalk usage now flows through centralized `ChalkUtils` for consistent behavior
- **Performance**: Cached chalk instances with smart invalidation when color settings change
- **CI Colors**: Enhanced color detection that works reliably in CI environments
- Timestamps and prefixes now use centralized color logic
- Log message styling (bold, dim) uses centralized chalk instances
- SafeStringUtils formatting methods use centralized color management
- Theme color definitions use centralized chalk instances

### Fixed

- **CRITICAL**: Color display issues in CI environments where Chalk was overly conservative
- Initialization order issues with static theme definitions
- Inconsistent color behavior between different components (logger, spinners, separators)
- Module loading edge cases during static initialization

### Changed

- Converted `ThemeProvider.DEFAULT_THEMES` from static property to getter method
- Updated all formatters to use `ChalkUtils` instead of direct chalk imports
- Removed direct chalk imports from all source files except the centralized utility
- Enhanced `ChalkUtils.colorize()` method with switch statement for better performance

### Development

- Maintained 100% test compatibility (345 tests passing)
- Improved code organization with centralized color management
- Better separation of concerns between color logic and business logic

## [0.0.2] - 2025-06-25

### Added

- Pre-commit hooks with Husky and lint-staged for code quality
- DEVLOGR_NO_ICONS environment variable support
- Comprehensive test suite for icon visibility functionality
- Interactive environment variables demo
- Contributing guide with development workflow

### Fixed

- **CRITICAL**: PLAIN level alignment when icons are enabled - symbols now properly align
- Package-lock.json synchronization issues

### Improved

- Enhanced README documentation with comprehensive spinner examples
- Improved demo presentation with clear screen and timing
- Better Listr2 integration examples
- Updated demo GIF showcasing fixed alignment
- Simplified spinner documentation with focused examples
- Enhanced environment variables documentation

### Changed

- Integrated icon visibility into theme system
- Cleaned up theme integration and removed parameter passing
- Updated terminalizer configuration for better demo recording

### Development

- Added comprehensive test coverage (310+ tests)
- Improved code formatting and linting setup
- Better development workflow with pre-commit validation

## [0.0.1] - 2025-06-24

### Added

- Initial release of DevLogr
- Core logging functionality with multiple levels
- Spinner system with Listr2 integration
- Environment variable configuration
- JSON output mode
- Terminal capability detection
- CI/CD friendly output
 