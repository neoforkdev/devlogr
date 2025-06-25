# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
