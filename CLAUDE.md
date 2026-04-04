# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest tests
npm run db:reset     # Reset the SQLite database
```

The app runs without an `ANTHROPIC_API_KEY` — it falls back to a mock provider that returns static demo code.

## Architecture

UIGen is a Next.js 15 App Router application where users describe React components in a chat interface and Claude generates/edits them live via tool calls. The generated code runs in-browser — no files are ever written to disk.

### Core Data Flow

```
User message → ChatContext (useChat) → POST /api/chat
  → Claude streams text + tool calls (str_replace_editor, file_manager)
  → FileSystemContext handles tool results → VirtualFileSystem updates
  → PreviewFrame re-renders (Babel transforms JSX → JS, builds import map, injects into iframe)
```

### Key Abstractions

**VirtualFileSystem** (`/lib/file-system.ts`)  
In-memory Map-based file tree. All file operations happen here. Serializable to JSON for DB persistence. Never touches the real filesystem.

**FileSystemContext** (`/lib/contexts/file-system-context.tsx`)  
React context wrapping `VirtualFileSystem`. Translates Claude tool call results (`str_replace_editor`, `file_manager`) into file system mutations and triggers UI re-renders via a refresh counter.

**ChatContext** (`/lib/contexts/chat-context.tsx`)  
Wraps Vercel AI SDK's `useChat`. Passes the serialized file system to `/api/chat` on each request so Claude has full context of current files.

**AI Tools** (`/lib/tools/`)  
- `str_replace_editor`: `create`, `view`, `str_replace`, `insert` operations on files  
- `file_manager`: `rename`, `delete` operations  
Defined using Vercel AI SDK's `tool()` helper and executed server-side in `/app/api/chat/route.ts`.

**PreviewFrame** (`/components/preview/PreviewFrame.tsx`)  
Uses Babel Standalone to transform JSX → JS in-browser. Builds an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) mapping `@/` aliases and bare specifiers (third-party packages) to esm.sh CDN URLs, then creates blob URLs for all local files and injects everything into a sandboxed iframe.

**Provider** (`/lib/provider.ts`)  
Returns a Claude language model if `ANTHROPIC_API_KEY` is set, otherwise returns a mock that streams static code — allows development without an API key.

### Layout

Three-column resizable layout (`main-content.tsx`):
- **Left (35%)**: Chat — `MessageList` + `MessageInput`
- **Right (65%)**: Tabbed between:
  - **Preview**: Live iframe (`PreviewFrame`)
  - **Code**: `FileTree` + `CodeEditor` (Monaco) with vertical resizable split

### Persistence

Projects are stored in SQLite via Prisma with two JSON blob columns:
- `messages`: serialized chat history
- `data`: serialized `VirtualFileSystem`

Auth uses JWT in HTTP-only cookies (JOSE library). Anonymous users can work without an account; creating an account migrates their in-progress session.

### System Prompt

`/lib/prompts/generation.tsx` contains the Claude system prompt that instructs the model how to use the file editing tools and structure React components.
