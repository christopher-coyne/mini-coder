import { execSync } from "child_process";
import { logAction, logError } from "../../logger.js";

export function bashTool(toolInput: Record<string, string>): string {
  const cwd = process.cwd();
  logAction(`Running: ${toolInput.command}`);
  try {
    // DANGEROU: extremely dangerous, need to add safeguards in production version
    const output = execSync(toolInput.command, {
      cwd,
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });
    return output || "(no output)";
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; status?: number };
    const stdout = execErr.stdout || "";
    const stderr = execErr.stderr || "";
    const status = execErr.status ?? 1;
    logError(`Exit code: ${status}`);
    return `Exit code: ${status}\n${stdout}\n${stderr}`.trim();
  }
}
