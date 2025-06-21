import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * File system utilities for safe file operations
 */
export class FileUtils {
  /**
   * Safely reads file content, returns null on error
   */
  static async safeReadFile(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  /**
   * Gets relative path from current working directory
   */
  static getDisplayPath(filePath: string): string {
    try {
      const relative = path.relative(process.cwd(), filePath);
      return relative.length < filePath.length ? relative : filePath;
    } catch {
      return filePath;
    }
  }
} 