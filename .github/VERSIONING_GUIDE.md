# 0.0.x Versioning Strategy for @neofork/devlogr

This guide explains how to manage versions when using the `0.0.x` versioning scheme for early development.

## 🎯 **0.0.x Version Philosophy**

The `0.0.x` versioning indicates:

- **Early Development**: Package is in initial development phase
- **Rapid Iteration**: Frequent changes and improvements expected
- **Breaking Changes**: May occur without major version bumps
- **Experimental**: API may change based on feedback

## 📋 **Version Increment Rules**

### **0.0.x → 0.0.y (Patch)**

```bash
npm version patch
# 0.0.1 → 0.0.2
```

**Use for:**

- Bug fixes
- Small improvements
- Documentation updates
- Minor feature additions
- Performance improvements

### **0.0.x → 0.1.0 (Minor)**

```bash
npm version minor
# 0.0.15 → 0.1.0
```

**Use for:**

- Significant feature additions
- API stabilization
- Major improvements
- When ready for broader testing

### **0.x.y → 1.0.0 (Major)**

```bash
npm version major
# 0.5.2 → 1.0.0
```

**Use for:**

- Stable, production-ready release
- API is finalized
- Breaking changes are minimal going forward
- Ready for widespread adoption

## 🚀 **Practical Examples**

### **Starting Development**

```bash
# Initial release
git tag v0.0.1
git push --follow-tags
# Create GitHub release → publishes 0.0.1
```

### **Regular Development Cycle**

```bash
# Small improvements/fixes
npm version patch        # 0.0.1 → 0.0.2
git push --follow-tags

npm version patch        # 0.0.2 → 0.0.3
git push --follow-tags

# Significant feature
npm version minor        # 0.0.3 → 0.1.0
git push --follow-tags
```

### **Pre-1.0 Development**

```bash
# Continue iterating
npm version patch        # 0.1.0 → 0.1.1
npm version minor        # 0.1.1 → 0.2.0
npm version minor        # 0.2.0 → 0.3.0

# Ready for production
npm version major        # 0.3.0 → 1.0.0
```

## 🧪 **Prerelease Versions in 0.0.x**

You can still use prereleases with 0.0.x:

```bash
# Alpha testing
npm version prerelease --preid=alpha
# 0.0.1 → 0.0.2-alpha.0

# Beta testing
npm version prerelease --preid=beta
# 0.0.1 → 0.0.2-beta.0

# Release candidate
npm version prerelease --preid=rc
# 0.0.1 → 0.0.2-rc.0
```

## 📦 **GitHub Actions Compatibility**

All your existing GitHub Actions workflows work perfectly with `0.0.x` versioning:

- ✅ **CI Workflow**: Runs on every push/PR
- ✅ **Release Workflow**: Publishes stable `0.0.x` versions
- ✅ **Prerelease Workflow**: Publishes `0.0.x-beta.y` versions

## 🎯 **Migration Path Examples**

### **Current State → 0.0.x**

```bash
# Reset to early development
npm version 0.0.1 --no-git-tag-version
git add package.json
git commit -m "Reset to 0.0.1 for initial development"
git tag v0.0.1
git push --follow-tags
```

### **0.0.x → Production Ready**

```bash
# When ready for production
npm version major        # 0.0.15 → 1.0.0
git push --follow-tags
```

## 🏷️ **NPM Tag Strategy**

### **Stable Releases**

- `0.0.1`, `0.0.2`, etc. → Published to `latest` tag
- Users install with: `npm install @neofork/devlogr`

### **Prereleases**

- `0.0.2-beta.0` → Published to `beta` tag
- Users install with: `npm install @neofork/devlogr@beta`

### **Development Versions**

- `0.0.2-alpha.0` → Published to `alpha` tag
- Users install with: `npm install @neofork/devlogr@alpha`

## 📊 **Version Timeline Example**

```
0.0.1  → Initial release (basic logging)
0.0.2  → Add spinner support
0.0.3  → Fix spinner bugs
0.0.4  → Add timestamp support
0.0.5  → Performance improvements
0.1.0  → Major feature: JSON mode
0.1.1  → Bug fixes
0.2.0  → Major feature: Custom themes
0.3.0  → API improvements
1.0.0  → Production ready, stable API
```

## ⚠️ **Important Notes**

### **Breaking Changes in 0.0.x**

- Breaking changes are **expected** in `0.0.x`
- Users understand the package is experimental
- Document breaking changes in release notes
- Consider deprecation warnings when possible

### **Semantic Versioning Relaxed**

- `0.0.x` doesn't follow strict semver
- Focus on iteration speed over strict compatibility
- Patch versions can include new features
- Minor versions can include breaking changes

### **Communication**

- Clearly document that package is in `0.0.x` (experimental)
- Use GitHub releases to communicate changes
- Consider using prerelease versions for testing
- Update README with current development status

## 🚀 **Quick Commands**

```bash
# Common 0.0.x workflows
npm version patch && git push --follow-tags    # 0.0.1 → 0.0.2
npm version minor && git push --follow-tags    # 0.0.5 → 0.1.0
npm version major && git push --follow-tags    # 0.5.0 → 1.0.0

# Prerelease testing
npm version prerelease --preid=beta && git push --follow-tags
```

## 📝 **Best Practices**

1. **Start with 0.0.1** for initial development
2. **Use patch versions** for regular iterations
3. **Use minor versions** for significant milestones
4. **Document changes** in GitHub releases
5. **Test with prereleases** before stable releases
6. **Communicate status** clearly to users
7. **Move to 1.0.0** when API is stable
