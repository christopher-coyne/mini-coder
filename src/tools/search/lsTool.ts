import * as path from "path";
import { execSync } from "child_process";
import { logAction, logError } from "../../logger.js";

export function lsTool(toolInput: Record<string, string>): string {
  const cwd = process.cwd();
  const dirPath = path.resolve(cwd, toolInput.path || ".");
  logAction(`Listing: ${dirPath}`);

  try {
    const output = execSync(`ls -la "${dirPath}"`, {
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
    return output.trim() || "Directory is empty.";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error listing directory: ${msg}`);
    return `Error: ${msg}`;
  }
}
