import * as fs from "fs";
import * as path from "path";
import { logAction, logError } from "../../logger.js";

export function writeFile(toolInput: Record<string, string>): string {
  const filePath = path.resolve(process.cwd(), toolInput.path);
  logAction(`Writing: ${filePath}`);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, toolInput.content, "utf-8");
    return `Successfully wrote to ${filePath}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error writing file: ${msg}`);
    return `Error: ${msg}`;
  }
}
