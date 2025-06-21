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

**Target Version:** `v0.0.2` (or desired version)

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
   # For 0.0.x development
   npm version patch          # 0.0.1 → 0.0.2 (most common)
   npm version minor          # 0.0.5 → 0.1.0 (significant features)
   npm version major          # 0.5.0 → 1.0.0 (production ready)
   
   # For prerelease testing
   npm version prerelease --preid=beta  # 0.0.1 → 0.0.2-beta.0
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