import * as path from "path";
import { globSync } from "glob";
import { logAction, logError } from "../../logger.js";

export function globTool(toolInput: Record<string, string>): string {
  const cwd = process.cwd();
  const searchPath = toolInput.path ? path.resolve(cwd, toolInput.path) : cwd;
  logAction(`Glob: ${toolInput.pattern} in ${searchPath}`);
  try {
    const matches = globSync(toolInput.pattern, {
      cwd: searchPath,
      nodir: true,
    });
    if (matches.length === 0) {
      return "No files matched the pattern.";
    }
    return matches.join("\n");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error in glob: ${msg}`);
    return `Error: ${msg}`;
  }
}
