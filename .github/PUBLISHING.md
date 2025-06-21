# Publishing Guide for @neofork/devlogr


This document explains how to set up and use the automated publishing pipeline for the `@neofork/devlogr` npm package.

## 🚀 GitHub Actions Workflows

We have three automated workflows:

### 1. **CI Workflow** (`.github/workflows/ci.yml`)
- **Triggers:** Push/PR to `main` or `develop` branches
- **Purpose:** Continuous integration testing
- **Actions:**
  - Tests on Node.js 16, 18, and 20
  - Runs linting and builds
  - Generates test coverage
  - Uploads coverage to Codecov

### 2. **Release Workflow** (`.github/workflows/release.yml`)
- **Triggers:** When a GitHub release is published
- **Purpose:** Publish stable versions to npm
- **Actions:**
  - Runs full CI pipeline
  - Publishes to npm with provenance
  - Creates release summary

### 3. **Prerelease Workflow** (`.github/workflows/prerelease.yml`)
- **Triggers:** When a GitHub prerelease is created
- **Purpose:** Publish beta/alpha versions
- **Actions:**
  - Auto-detects prerelease tag (alpha, beta, rc)
  - Publishes with appropriate npm tag
  - Creates prerelease summary

## 🔐 Setup Instructions

### Step 1: Create NPM Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click your profile → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Choose **"Automation"** type
5. Copy the generated token

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

## 📦 Publishing Process

### Publishing a Stable Release

1. **Update version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.0.0 → 1.0.1)
   npm version minor  # for new features (1.0.0 → 1.1.0)
   npm version major  # for breaking changes (1.0.0 → 2.0.0)
   ```

2. **Push the version tag**:
   ```bash
   git push --follow-tags
   ```

3. **Create GitHub Release**:
   - Go to your repository → **Releases** → **"Create a new release"**
   - Choose the version tag you just pushed
   - Fill in release notes
   - Click **"Publish release"**

4. **Automatic Publishing**: The release workflow will automatically:
   - Run all tests
   - Build the package
   - Publish to npm with provenance
   - Create a summary with install instructions

### Publishing a Prerelease (Beta/Alpha)

1. **Update version** with prerelease identifier:
   ```bash
   npm version prerelease --preid=beta   # 1.0.0 → 1.0.1-beta.0
   npm version prerelease --preid=alpha  # 1.0.0 → 1.0.1-alpha.0
   npm version prerelease --preid=rc     # 1.0.0 → 1.0.1-rc.0
   ```

2. **Push the version tag**:
   ```bash
   git push --follow-tags
   ```

3. **Create GitHub Prerelease**:
   - Go to your repository → **Releases** → **"Create a new release"**
   - Choose the version tag
   - **Check "This is a pre-release"**
   - Fill in release notes
   - Click **"Publish release"**

4. **Automatic Publishing**: The prerelease workflow will:
   - Auto-detect the prerelease type (alpha/beta/rc)
   - Publish with the appropriate npm tag
   - Users can install with: `npm install @neofork/devlogr@beta`

## 🔍 Monitoring

### Check Workflow Status
- Go to **Actions** tab in your repository
- View workflow runs and their status
- Check logs for any errors

### Verify NPM Publication
- Visit: https://www.npmjs.com/package/@neofork/devlogr
- Check version and publication time
- Verify installation: `npm install @neofork/devlogr`

## 🛡️ Security Features

- **Provenance**: All releases include npm provenance for supply chain security
- **Permissions**: Workflows use minimal required permissions
- **Token Security**: NPM token stored as encrypted GitHub secret
- **Multi-Node Testing**: Tested on Node.js 16, 18, and 20

## 📋 Version Management Best Practices

### Semantic Versioning
- **Patch** (1.0.1): Bug fixes, no breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Prerelease Versions
- **Alpha** (`1.0.0-alpha.1`): Early development, unstable
- **Beta** (`1.0.0-beta.1`): Feature complete, testing phase
- **RC** (`1.0.0-rc.1`): Release candidate, final testing

### Example Workflow
```bash
# Development cycle
npm version prerelease --preid=alpha
git push --follow-tags
# Create prerelease on GitHub

# Feature complete
npm version prerelease --preid=beta  
git push --follow-tags
# Create prerelease on GitHub

# Ready for release
npm version minor
git push --follow-tags
# Create full release on GitHub
```

## 🚨 Troubleshooting

### Common Issues

1. **"npm publish failed"**
   - Check if version already exists on npm
   - Verify NPM_TOKEN secret is set correctly
   - Ensure package.json version is updated

2. **"Tests failed"**
   - All tests must pass before publishing
   - Check the Actions tab for detailed error logs
   - Fix issues and push again

3. **"Permission denied"**
   - Verify NPM_TOKEN has publish permissions
   - Check if you're a maintainer of the @neofork scope

### Getting Help

- Check workflow logs in the **Actions** tab
- Verify npm token permissions
- Ensure package.json is properly configured
- Contact repository maintainers for access issues

---

## 📝 Quick Reference

### Essential Commands
```bash
# Patch release (bug fixes)
npm version patch && git push --follow-tags

# Minor release (new features)  
npm version minor && git push --follow-tags

# Major release (breaking changes)
npm version major && git push --follow-tags

# Beta prerelease
npm version prerelease --preid=beta && git push --follow-tags
```

### Links
- **NPM Package**: https://www.npmjs.com/package/@neofork/devlogr
- **GitHub Repository**: https://github.com/neofork/devlogr
- **GitHub Actions**: https://github.com/neofork/devlogr/actions
- **Releases**: https://github.com/neofork/devlogr/releases 