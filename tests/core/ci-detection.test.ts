import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TerminalUtils } from '../../src/utils/terminal';
import { LogConfiguration } from '../../src/config';

describe('CI Detection', () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('CI Environment Detection', () => {
    it('should detect GitHub Actions CI', () => {
      process.env = { GITHUB_ACTIONS: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect GitLab CI', () => {
      process.env = { GITLAB_CI: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect CircleCI', () => {
      process.env = { CIRCLECI: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect Travis CI', () => {
      process.env = { TRAVIS: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect Jenkins', () => {
      process.env = { JENKINS_URL: 'http://jenkins.example.com' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect Azure DevOps', () => {
      process.env = { TF_BUILD: 'True' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect TeamCity', () => {
      process.env = { TEAMCITY_VERSION: '2021.1' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect AppVeyor', () => {
      process.env = { APPVEYOR: 'True' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect AWS CodeBuild', () => {
      process.env = { CODEBUILD_BUILD_ID: 'build-123' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect Netlify', () => {
      process.env = { NETLIFY: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect Vercel', () => {
      process.env = { VERCEL: '1' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should detect generic CI environment', () => {
      process.env = { CI: 'true' };
      expect(TerminalUtils.isCI()).toBe(true);
    });

    it('should not detect CI in normal environment', () => {
      process.env = {};
      expect(TerminalUtils.isCI()).toBe(false);
    });
  });

  describe('CI Configuration', () => {
    it('should return CI-optimized config when in CI', () => {
      process.env = { CI: 'true' };
      const config = TerminalUtils.getCIConfig();

      expect(config.showPrefix).toBe(true);
      expect(config.showTimestamp).toBe(true);
      expect(config.showIcons).toBe(false);
    });

    it('should return non-CI config when not in CI', () => {
      process.env = {};
      const config = TerminalUtils.getCIConfig();

      expect(config.showPrefix).toBe(false);
      expect(config.showTimestamp).toBe(false);
      expect(config.showIcons).toBe(true);
    });

    it('should return default behavior when CI detection is disabled', () => {
      process.env = { CI: 'true', DEVLOGR_DISABLE_CI_DETECTION: 'true' };
      const config = TerminalUtils.getCIConfig();

      expect(config.showPrefix).toBe(false);
      expect(config.showTimestamp).toBe(false);
      expect(config.showIcons).toBe(true);
    });

    it('should still apply CI config when disable flag is not true', () => {
      process.env = { CI: 'true', DEVLOGR_DISABLE_CI_DETECTION: 'false' };
      const config = TerminalUtils.getCIConfig();

      expect(config.showPrefix).toBe(true);
      expect(config.showTimestamp).toBe(true);
      expect(config.showIcons).toBe(false);
    });

    it('should keep dynamic color detection in CI', () => {
      process.env = { CI: 'true', FORCE_COLOR: '1' };
      const config = TerminalUtils.getCIConfig();

      expect(config.useColors).toBe(true);
    });

    it('should respect NO_COLOR in CI', () => {
      process.env = { CI: 'true', NO_COLOR: '1' };
      const config = TerminalUtils.getCIConfig();

      expect(config.useColors).toBe(false);
    });
  });

  describe('Emoji Detection', () => {
    it('should support emoji when Unicode is supported', () => {
      process.env = { DEVLOGR_UNICODE: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(true);
    });

    it('should not support emoji when explicitly disabled', () => {
      process.env = { NO_EMOJI: '1' };
      expect(TerminalUtils.supportsEmoji()).toBe(false);
    });

    it('should not support emoji when DEVLOGR_NO_EMOJI is set', () => {
      process.env = { DEVLOGR_NO_EMOJI: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(false);
    });

    it('should support emoji when explicitly enabled', () => {
      process.env = { DEVLOGR_EMOJI: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(true);
    });

    it('should use Unicode detection in CI environments', () => {
      process.env = { CI: 'true', DEVLOGR_UNICODE: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(true);
    });
  });

  describe('Configuration Integration', () => {
    it('should apply CI settings to logger configuration', () => {
      process.env = { CI: 'true' };
      const config = LogConfiguration.getConfig();

      expect(config.showPrefix).toBe(true);
      expect(config.showTimestamp).toBe(true);
      expect(config.showIcons).toBe(false);
    });

    it('should respect environment variables over CI defaults', () => {
      process.env = {
        CI: 'true',
        DEVLOGR_SHOW_PREFIX: 'false',
        DEVLOGR_SHOW_TIMESTAMP: 'false',
        DEVLOGR_NO_ICONS: 'false',
      };
      const config = LogConfiguration.getConfig();

      expect(config.showPrefix).toBe(false);
      expect(config.showTimestamp).toBe(false);
      expect(config.showIcons).toBe(true);
    });

    it('should include emoji support in configuration', () => {
      process.env = { DEVLOGR_UNICODE: 'true' };
      const config = LogConfiguration.getConfig();

      expect(config.supportsEmoji).toBe(true);
    });

    it('should disable emoji when NO_EMOJI is set', () => {
      process.env = { NO_EMOJI: '1' };
      const config = LogConfiguration.getConfig();

      expect(config.supportsEmoji).toBe(false);
    });

    it('should handle mixed CI and environment variable scenarios', () => {
      process.env = {
        GITHUB_ACTIONS: 'true',
        DEVLOGR_SHOW_TIMESTAMP: 'iso',
        NO_COLOR: '1',
      };
      const config = LogConfiguration.getConfig();

      expect(config.showPrefix).toBe(true); // CI default
      expect(config.showTimestamp).toBe(true); // Environment variable
      expect(config.showIcons).toBe(false); // CI default
      expect(config.useColors).toBe(false); // NO_COLOR respected
    });

    it('should disable CI detection when DEVLOGR_DISABLE_CI_DETECTION is true', () => {
      process.env = {
        CI: 'true',
        DEVLOGR_DISABLE_CI_DETECTION: 'true',
      };
      const config = LogConfiguration.getConfig();

      expect(config.showPrefix).toBe(false); // Default behavior
      expect(config.showTimestamp).toBe(false); // Default behavior
      expect(config.showIcons).toBe(true); // Default behavior
    });

    it('should allow environment variables to override even when CI detection is disabled', () => {
      process.env = {
        CI: 'true',
        DEVLOGR_DISABLE_CI_DETECTION: 'true',
        DEVLOGR_SHOW_PREFIX: 'true',
        DEVLOGR_SHOW_TIMESTAMP: 'true',
      };
      const config = LogConfiguration.getConfig();

      expect(config.showPrefix).toBe(true); // Environment variable override
      expect(config.showTimestamp).toBe(true); // Environment variable override
      expect(config.showIcons).toBe(true); // Default behavior (no override)
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined environment variables gracefully', () => {
      process.env = { CI: undefined, GITHUB_ACTIONS: undefined };
      expect(TerminalUtils.isCI()).toBe(false);
    });

    it('should handle empty string environment variables', () => {
      process.env = { CI: '', GITHUB_ACTIONS: '' };
      expect(TerminalUtils.isCI()).toBe(false);
    });

    it('should prioritize explicit disable over CI detection', () => {
      process.env = { CI: 'true', DEVLOGR_NO_EMOJI: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(false);
    });

    it('should prioritize explicit enable over CI detection', () => {
      process.env = { CI: 'true', DEVLOGR_EMOJI: 'true' };
      expect(TerminalUtils.supportsEmoji()).toBe(true);
    });
  });
});
