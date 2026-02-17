import * as fs from "fs";
import * as path from "path";
import { logAction, logError } from "../../logger.js";

export function readFile(toolInput: Record<string, string>): string {
  const filePath = path.resolve(process.cwd(), toolInput.path);
  logAction(`Reading: ${filePath}`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error reading file: ${msg}`);
    return `Error: ${msg}`;
  }
}
