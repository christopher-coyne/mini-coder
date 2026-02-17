import "dotenv/config";
import * as readline from "readline/promises";
import chalk from "chalk";
import { chat } from "./messageLLM.js";

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("close", () => {
    console.log(chalk.dim("\nGoodbye!"));
    process.exit(0);
  });

  console.log(chalk.hex('#4CAF50')(`
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
