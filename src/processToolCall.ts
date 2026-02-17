import { readFile } from "./tools/file-operations/readFile.js";
import { writeFile } from "./tools/file-operations/writeFile.js";
import { editFile } from "./tools/file-operations/editFile.js";
import { globTool } from "./tools/search/globTool.js";
import { grepTool } from "./tools/search/grepTool.js";
import { lsTool } from "./tools/search/lsTool.js";
import { bashTool } from "./tools/execution/bash.js";

export function processToolCall(
  toolName: string,
  toolInput: Record<string, string>
): string {
  switch (toolName) {
    case "read_file":
      return readFile(toolInput);
    case "write_file":
      return writeFile(toolInput);
    case "edit_file":
      return editFile(toolInput);
    case "glob":
      return globTool(toolInput);
    case "grep":
      return grepTool(toolInput);
    case "ls":
      return lsTool(toolInput);
case "bash":
      return bashTool(toolInput);
    default:
      return `Unknown tool: ${toolName}`;
  }
}
