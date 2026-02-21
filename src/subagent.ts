import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";
import ora from "ora";
import { exploreTools } from "./tools.js";
import { processToolCall } from "./processToolCall.js";
import { setLogPrefix } from "./logger.js";

const client = new Anthropic();

const EXPLORE_SYSTEM_PROMPT =
  "You are a code exploration agent. Search and read files to answer the user's question. Be thorough and concise.";

const MAX_TURNS = 15;

export async function runSubagent(prompt: string): Promise<string> {
  console.log(chalk.cyan("\n[Explore agent started]"));

  let spinner = ora({ text: "Exploring codebase...", spinner: "dots" }).start();
  setLogPrefix("SUBAGENT");
  try {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: prompt },
    ];

    let response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: EXPLORE_SYSTEM_PROMPT,
      messages,
      tools: exploreTools,
    });

    messages.push({ role: "assistant", content: response.content });

    let turns = 0;
    while (response.stop_reason === "tool_use" && turns < MAX_TURNS) {
      turns++;
      spinner.text = `Exploring codebase (turn ${turns}/${MAX_TURNS})...`;
      
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => ({
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: await processToolCall(
            toolUse.name,
            toolUse.input as Record<string, string>
          ),
        }))
      );

      messages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: EXPLORE_SYSTEM_PROMPT,
        messages,
        tools: exploreTools,
      });

      messages.push({ role: "assistant", content: response.content });
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block) => block.type === "text"
    );
    const result = textBlocks.map((b) => b.text).join("\n");

    if (spinner.isSpinning) spinner.stop();
    console.log(chalk.cyan("[Explore agent finished]"));

    return result;
  } catch (err) {
    if (spinner.isSpinning) spinner.stop();
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`[Explore agent error: ${message}]`));
    return `Explore agent failed: ${message}`;
  } finally {
    setLogPrefix("");
  }
}
