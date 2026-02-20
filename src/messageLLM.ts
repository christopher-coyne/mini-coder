import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import ora from "ora";
import { readFileSync } from "fs";
import { join } from "path";
import { tools } from "./tools.js";
import { processToolCall } from "./processToolCall.js";
import { compactMessages } from "./compactMessages.js";

const client = new Anthropic();

// Conversation history
const messages: Anthropic.MessageParam[] = [];

const BASE_SYSTEM_PROMPT = `Be helpful and concise in your answers. You have access to tools for reading and writing files. Use them when the user asks you to work with files.`;

function getSystemPrompt(): string {
  const coderMdPath = join(process.cwd(), ".coder", "CODER.md");
  try {
    const coderMd = readFileSync(coderMdPath, "utf-8");
    return `${BASE_SYSTEM_PROMPT}\n\n# Project Instructions (from CODER.md)\n\n${coderMd}`;
  } catch {
    return BASE_SYSTEM_PROMPT;
  }
}

// token limit of 100k before autocompacting
const TOKEN_LIMIT = 100000;

let lastTokenCount = 0;

function logTokenUsage(usage: Anthropic.Usage): void {
  lastTokenCount = usage.input_tokens + usage.output_tokens;
  console.log(chalk.dim(`\n[Total tokens: ${lastTokenCount}]`));
}

export async function chat(userMessage: string): Promise<void> {
  messages.push({ role: "user", content: userMessage });

  let spinner = ora("Thinking...").start();

  // Stream the initial response
  const stream = client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: getSystemPrompt(),
    messages,
    tools,
  });

  stream.on("text", (text) => {
    if (spinner.isSpinning) spinner.stop();
    process.stdout.write(text);
  });

  let response = await stream.finalMessage();
  if (spinner.isSpinning) spinner.stop();
  logTokenUsage(response.usage);
  messages.push({ role: "assistant", content: response.content });

  // Agentic loop: keep going while the model wants to use tools
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use"
    );

    const toolResults = toolUseBlocks.map(
      (toolUse) => ({
        type: "tool_result" as const,
        tool_use_id: toolUse.id,
        content: processToolCall(
          toolUse.name,
          toolUse.input as Record<string, string>
        ),
      })
    );

    messages.push({ role: "user", content: toolResults });

    spinner = ora("Thinking...").start();

    // Stream the follow-up response
    const followUp = client.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: getSystemPrompt(),
      messages,
      tools,
    });

    followUp.on("text", (text) => {
      if (spinner.isSpinning) spinner.stop();
      process.stdout.write(text);
    });

    response = await followUp.finalMessage();
    if (spinner.isSpinning) spinner.stop();
    logTokenUsage(response.usage);
    messages.push({ role: "assistant", content: response.content });
  }

  console.log(); // newline after output

  // Auto-compact when conversation gets too long
  if (lastTokenCount > TOKEN_LIMIT) {
    console.log('compacting ', lastTokenCount, TOKEN_LIMIT)
    await compact();
  }
}

export async function compact(): Promise<void> {
  const spinner = ora("Compacting...").start();
  await compactMessages(messages);
  spinner.stop();

  const { input_tokens } = await client.messages.countTokens({
    model: "claude-sonnet-4-5-20250929",
    system: getSystemPrompt(),
    messages,
    tools,
  });
  console.log(chalk.dim(`[Conversation compacted — ${input_tokens} tokens]`));
}
