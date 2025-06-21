---
name: Release Request
about: Request a new release of @neofork/devlogr
title: 'Release v[VERSION]'
labels: 'release'
assignees: ''
---

## Release Information

**Release Type:**
- [ ] Patch (bug fixes)
- [ ] Minor (new features)
- [ ] Major (breaking changes)
- [ ] Prerelease (alpha/beta/rc)

**Target Version:** `v1.0.0`

## Changes Included

### 🚀 New Features
- 

### 🐛 Bug Fixes
- 

### 💥 Breaking Changes
- 

### 📚 Documentation
- 

### 🧪 Tests
- 

## Pre-Release Checklist

- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] All PRs merged to main

## Release Process

1. **Update version:**
   ```bash
   npm version [patch|minor|major|prerelease --preid=beta]
   ```

2. **Push tags:**
   ```bash
   git push --follow-tags
   ```

3. **Create GitHub Release:**
   - Go to [Releases](https://github.com/neofork/devlogr/releases)
   - Click "Create a new release"
   - Select the version tag
   - Add release notes
   - Publish release

4. **Verify Publication:**
   - Check [NPM package](https://www.npmjs.com/package/@neofork/devlogr)
   - Verify [GitHub Actions](https://github.com/neofork/devlogr/actions) completed successfully

## Additional Notes

<!-- Add any additional context or notes about this release --> 