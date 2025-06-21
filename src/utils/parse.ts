/**
 * Parsing utilities for extracting structured information from text
 */
export class ParseUtils {
  /**
   * Extracts line and column numbers from error messages
   */
  static extractLineColumn(message: string): { line: number; column: number } | null {
    const patterns = [
      /line (\d+):(\d+)/i,
      /line (\d+), column (\d+)/i,
      /at line (\d+):(\d+)/i,
      /:(\d+):(\d+)/,
      /\((\d+):(\d+)\)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return { line: parseInt(match[1], 10), column: parseInt(match[2], 10) };
      }
    }
    return null;
  }
} 