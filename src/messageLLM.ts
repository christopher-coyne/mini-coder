import chalk from "chalk";
import Anthropic from "@anthropic-ai/sdk";
import ora from "ora";
import { tools } from "./tools.js";
import { processToolCall } from "./processToolCall.js";

const client = new Anthropic();

// Conversation history
const messages: Anthropic.MessageParam[] = [];

const SYSTEM_PROMPT = `Be helpful and concise in your answers. You have access to tools for reading and writing files. Use them when the user asks you to work with files.`;


export async function chat(userMessage: string): Promise<void> {
  messages.push({ role: "user", content: userMessage });

  let spinner = ora("Thinking...").start();

  // Stream the initial response
  const stream = client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
    tools,
  });

  stream.on("text", (text) => {
    if (spinner.isSpinning) spinner.stop();
    process.stdout.write(text);
  });

  let response = await stream.finalMessage();
  if (spinner.isSpinning) spinner.stop();
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
      system: SYSTEM_PROMPT,
      messages,
      tools,
    });

    followUp.on("text", (text) => {
      if (spinner.isSpinning) spinner.stop();
      process.stdout.write(text);
    });

    response = await followUp.finalMessage();
    if (spinner.isSpinning) spinner.stop();
    messages.push({ role: "assistant", content: response.content });
  }

  console.log(); // newline after output
}
