import * as fs from "fs";
import * as path from "path";
import { logAction, logError } from "../../logger.js";

export function editFile(toolInput: Record<string, string>): string {
  const filePath = path.resolve(process.cwd(), toolInput.path);
  logAction(`Editing: ${filePath}`);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { old_string, new_string } = toolInput;

    const occurrences = content.split(old_string).length - 1;

    if (occurrences === 0) {
      logError("No match found");
      return `Error: old_string not found in file`;
    }

    // TODO: might be multiple strings that match old_string, have to handle this
    if (occurrences > 1) {
      logError(`Multiple matches found: ${occurrences}`);
      return `Error: found ${occurrences} matches of old_string. Include more surrounding context to make the match unique.`;
    }

    const newContent = content.replace(old_string, new_string);
    fs.writeFileSync(filePath, newContent, "utf-8");
    return `Successfully edited ${filePath}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error editing file: ${msg}`);
    return `Error: ${msg}`;
  }
}
