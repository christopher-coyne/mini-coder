import "dotenv/config";
import * as readline from "readline/promises";
import chalk from "chalk";
import { chat, compact } from "./messageLLM.js";
import { loadSkills } from "./skills.js";

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("close", () => {
    console.log(chalk.dim("\nGoodbye!"));
    process.exit(0);
  });

  console.log(chalk.hex('#2196F3')(`
  ███╗   ███╗██╗███╗   ██╗██╗      ██████╗ ██████╗ ██████╗ ███████╗██████╗
  ████╗ ████║██║████╗  ██║██║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗
  ██╔████╔██║██║██╔██╗ ██║██║     ██║     ██║   ██║██║  ██║█████╗  ██████╔╝
  ██║╚██╔╝██║██║██║╚██╗██║██║     ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗
  ██║ ╚═╝ ██║██║██║ ╚████║██║     ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
  ═══════════════════════════════════════════════════════════════════════════
  `));
  console.log(chalk.dim("  Type your message and press Enter. Ctrl+C to exit.\n"));

  while (true) {
    const input = await rl.question("> ");
    const trimmed = input.trim();
    if (!trimmed) continue;

    // Handle slash commands
    if (trimmed.startsWith("/")) {
      const command = trimmed.slice(1).split(/\s+/)[0];
      switch (command) {
        case "compact":
          await compact();
          console.log();
          continue;
        default: {
          // Check if it matches a skill name
          const skills = loadSkills();
          const skill = skills.find((s) => s.name === command);
          if (skill) {
            const rest = trimmed.slice(1 + command.length).trim();
            const prompt = rest
              ? `Use the ${skill.name} skill. ${rest}`
              : `Use the ${skill.name} skill to help me.`;
            await chat(prompt);
            console.log();
            continue;
          }
          console.log(chalk.red(`Unknown command: /${command}`));
          console.log();
          continue;
        }
      }
    }

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
