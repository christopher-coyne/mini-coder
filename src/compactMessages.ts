import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function compactMessages(
  messages: Anthropic.MessageParam[]
): Promise<void> {
  const summary = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: "You are a conversation summarizer. Summarize the following conversation into a concise but comprehensive summary. Capture: key decisions made, current state of files/code, pending tasks, important context the assistant would need to continue helping. Be thorough but concise.",
    messages: [
      {
        role: "user",
        content: `Summarize this conversation:\n\n${messages
          .map((m) => {
            const content =
              typeof m.content === "string"
                ? m.content
                : JSON.stringify(m.content);
            return `${m.role}: ${content}`;
          })
          .join("\n\n")}`,
      },
    ],
  });

  const summaryText =
    summary.content[0].type === "text" ? summary.content[0].text : "";

  // Replace all messages with a single summary
  messages.length = 0;
  messages.push({
    role: "user",
    content: `Here is a summary of our conversation so far:\n\n${summaryText}\n\nPlease continue helping me based on this context.`,
  });
  messages.push({
    role: "assistant",
    content:
      "Got it — I have the full context from our conversation. How can I help you next?",
  });

}
