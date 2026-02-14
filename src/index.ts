import "dotenv/config";
import * as readline from "readline/promises";
import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Conversation history
const messages: Anthropic.MessageParam[] = [];

const SYSTEM_PROMPT = `Be helpful and concise in your answers`;

async function chat(userMessage: string): Promise<void> {
  messages.push({ role: "user", content: userMessage });

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });

  let fullText = "";
  stream.on("text", (text) => {
    process.stdout.write(text);
    fullText += text;
  });

  const response = await stream.finalMessage();
  messages.push({ role: "assistant", content: response.content });

  console.log(); // newline after streamed output
}

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("close", () => {
    console.log(chalk.dim("\nGoodbye!"));
    process.exit(0);
  });

  console.log(chalk.blue(`
  ███╗   ███╗██╗███╗   ██╗██╗      ██████╗ ██████╗ ██████╗ ███████╗██████╗
  ████╗ ████║██║████╗  ██║██║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗
  ██╔████╔██║██║██╔██╗ ██║██║     ██║     ██║   ██║██║  ██║█████╗  ██████╔╝
  ██║╚██╔╝██║██║██║╚██╗██║██║     ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗
  ██║ ╚═╝ ██║██║██║ ╚████║██║     ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
  `));
  console.log(chalk.dim("  Type your message and press Enter. Ctrl+C to exit.\n"));

  while (true) {
    const input = await rl.question("> ");
    const trimmed = input.trim();
    if (!trimmed) continue;

    try {
      console.log();
      await chat(trimmed);
      console.log();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`Error: ${message}`));
      console.log();
    }
  }
}

main().catch(() => {
  console.log(chalk.dim("\nGoodbye!"));
  process.exit(0);
});
