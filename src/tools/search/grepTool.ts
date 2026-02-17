import * as path from "path";
import { execSync } from "child_process";
import { logAction, logError } from "../../logger.js";

export function grepTool(toolInput: Record<string, string>): string {
  const cwd = process.cwd();
  const searchPath = toolInput.path ? path.resolve(cwd, toolInput.path) : cwd;
  const pattern = toolInput.pattern;
  const include = toolInput.file_pattern ? `--include="${toolInput.file_pattern}"` : "";
  logAction(`Grep: "${pattern}" in ${searchPath}`);

  try {
    const output = execSync(
      `grep -rn ${include} --exclude-dir=node_modules --exclude-dir=.git "${pattern}" .`,
      {
        cwd: searchPath,
        encoding: "utf-8",
        maxBuffer: 1024 * 1024,
      }
    );
    return output.trim() || "No matches found.";
  } catch (err: unknown) {
    const execErr = err as { status?: number; stdout?: string };
    if (execErr.status === 1) {
      return "No matches found.";
    }
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error in grep: ${msg}`);
    return `Error: ${msg}`;
  }
}
