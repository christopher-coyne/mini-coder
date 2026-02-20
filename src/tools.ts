import Anthropic from "@anthropic-ai/sdk";
import { loadSkills } from "./skills.js";

const baseTools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description:
      "Read the contents of a file at the given path. Returns the file content as a string.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "The path to the file to read",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description:
      "Write content to a file at the given path. Creates the file if it doesn't exist, overwrites if it does.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "The path to the file to write",
        },
        content: {
          type: "string",
          description: "The content to write to the file",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "edit_file",
    description:
      "Edit a file by replacing an exact string match with new content. The old_string must be unique within the file — include enough surrounding context to ensure a unique match. If multiple matches are found, the edit will fail and you should retry with more context.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "The path to the file to edit",
        },
        old_string: {
          type: "string",
          description:
            "The exact string to find in the file. Must be unique within the file.",
        },
        new_string: {
          type: "string",
          description: "The string to replace old_string with",
        },
      },
      required: ["path", "old_string", "new_string"],
    },
  },
  {
    name: "glob",
    description:
      "Find files matching a glob pattern. Returns a list of matching file paths relative to the search directory.",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern: {
          type: "string",
          description: 'The glob pattern to match (e.g. "**/*.ts", "src/**/*.js")',
        },
        path: {
          type: "string",
          description: "The directory to search in. Defaults to the current working directory.",
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "grep",
    description:
      "Search file contents using a regex pattern. Returns matching lines with file paths and line numbers.",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern: {
          type: "string",
          description: "The regex pattern to search for",
        },
        path: {
          type: "string",
          description: "The directory to search in. Defaults to the current working directory.",
        },
        file_pattern: {
          type: "string",
          description: 'Glob pattern to filter which files to search (e.g. "**/*.ts"). Defaults to all files.',
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "ls",
    description:
      "List the contents of a directory. Returns file and directory names, with directories marked with a trailing slash.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "The directory to list. Defaults to the current working directory.",
        },
      },
      required: [],
    },
  },
  {
    name: "bash",
    description:
      "Run a shell command and return its output. Use this for running tests, installing packages, git operations, starting servers, or any other terminal command. Commands time out after 30 seconds.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute",
        },
      },
      required: ["command"],
    },
  },
];

function buildTools(): Anthropic.Tool[] {
  const skills = loadSkills();
  if (skills.length === 0) return baseTools;

  const skillList = skills
    .map((s) => `- ${s.name}: ${s.description}`)
    .join("\n");

  const useSkillTool: Anthropic.Tool = {
    name: "use_skill",
    description: `Invoke a skill to get specialized instructions for a task. Available skills:\n\n${skillList}\n\nCall this tool with the skill name to receive its instructions, then follow them.`,
    input_schema: {
      type: "object" as const,
      properties: {
        skill_name: {
          type: "string",
          description: "The name of the skill to invoke",
        },
      },
      required: ["skill_name"],
    },
  };

  return [...baseTools, useSkillTool];
}

export const tools: Anthropic.Tool[] = buildTools();
