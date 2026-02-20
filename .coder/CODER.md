# Mini Coder

An agentic CLI coding assistant built with TypeScript and the Anthropic SDK.

## Stack

- TypeScript with ESM modules
- Anthropic Claude API (claude-sonnet-4-5-20250929)
- Runs via `tsx` (`npm start` or `npm run dev`)

## Project Structure

- `src/index.ts` — REPL loop and slash command handling
- `src/messageLLM.ts` — Chat function, streaming, agentic tool loop, auto-compaction
- `src/tools.ts` — Tool definitions for the Claude API
- `src/processToolCall.ts` — Tool call dispatcher
- `src/tools/` — Individual tool implementations (read, write, edit, glob, grep, ls, bash)
- `src/compactMessages.ts` — Conversation summarization for context management
