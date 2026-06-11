# ContextBridge

**Move your AI coding session from one model to another without starting over.**

ContextBridge is a VS Code extension that captures, organizes, and exports AI coding context so you can seamlessly continue work across Claude, Codex, Cursor, ChatGPT, GitHub Copilot, or any other AI assistant.

## The Problem

When working with AI coding assistants, you often need to switch models:
- Your context window fills up
- You want to try a different assistant
- You need specialized tools for specific tasks
- Your token budget runs out

When this happens, you manually explain everything again to the new assistant:
- What you were building
- Which files matter
- What decisions you made
- What constraints exist
- What errors you hit
- What's already done
- What comes next

**This is repetitive, lossy, and time-consuming.**

## The Solution

ContextBridge generates a structured, **AI-ready context package** with one click.

```
Click "Create Context Package"
  ↓
Answer a few quick questions (30 seconds)
  ↓
ContextBridge captures your Git state, selected files, and context
  ↓
Get 4 ready-to-paste handoff prompts (Claude, Codex, Cursor, Generic)
  ↓
Paste into any AI assistant and continue work immediately
```

## Features

### Core Capabilities

- **Context Capture** — Record your goal, task description, constraints, decisions, completed work, blockers, and next actions
- **Git Integration** — Automatically detect your branch, modified/added/deleted files, and diff summary
- **File Selection** — Tag relevant files with relevance levels (high, medium, low, reference)
- **Provider Exports** — Generate handoff prompts optimized for:
  - **Claude** — Reasoning-focused, preserves architecture and decisions
  - **Codex** — Implementation-focused, code-generation oriented
  - **Cursor** — Workspace-context format with IDE guidance
  - **Generic** — Tool-neutral Markdown for any AI assistant

### What Gets Generated

```
.contextbridge/
├── context.yaml                    # Machine-readable full context
├── AI_CONTEXT.md                   # Human-readable summary
└── exports/
    ├── claude_handoff.md           # Claude-optimized prompt
    ├── codex_handoff.md            # Codex-optimized prompt
    ├── cursor_handoff.md           # Cursor workspace context
    └── generic_handoff.md          # Generic AI assistant format
```

## Installation

### From Source

1. Clone this repo
   ```bash
   git clone https://github.com/sharmapuneet1510/ai-context-bridge.git
   cd ai-context-bridge
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Launch in VS Code
   ```bash
   npm run compile
   code .
   # Then press F5 to debug the extension
   ```

### From VS Code Marketplace

Coming soon in v1.0.

## Quick Start

### 1. Create a Context Package

1. Open a project in VS Code
2. Press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
3. Search for **"ContextBridge: Create Context Package"**
4. Answer the prompts:
   - **Current Goal** — What are you trying to build?
   - **Task Description** — What specific work are you doing?
   - **Constraints** — Any requirements or limitations?
   - **Decisions Made** — Key architectural/technical decisions
   - **Completed Work** — What's already done
   - **Open Issues** — What's blocking you
   - **Next Actions** — What should the AI do next
   - **Files** — Space-separated paths of relevant files

5. ContextBridge creates `.contextbridge/` with all exports

### 2. Export for Your AI Assistant

Pick whichever assistant you want to use:

```
Command Palette (Ctrl+Shift+P)
  ↓
Choose one:
  • ContextBridge: Export for Claude
  • ContextBridge: Export for Codex
  • ContextBridge: Export for Cursor
```

### 3. Use the Handoff Prompt

1. Open the generated export file (e.g., `claude_handoff.md`)
2. Copy the entire content
3. Paste into Claude, Codex, Cursor, or ChatGPT
4. Continue your work

## Example: Claude Handoff Prompt

Here's what a generated Claude prompt looks like:

```markdown
# Continue Existing Software Engineering Task

You are continuing an existing software engineering task. Use the context below as the source of truth.

## Project

Project name: my-app
Tech stack:
- TypeScript
- React
- Node.js

Current Git branch: feature/auth-flow

## Current Goal

Implement user authentication flow with JWT tokens

## Task Description

Add login/logout functionality to the React frontend. Integrate with existing Node.js auth service.

## Relevant Files

High relevance:
- src/components/LoginForm.tsx
- src/services/authService.ts
- src/types/auth.ts

Medium relevance:
- src/App.tsx

## Git Changes Summary

Modified:
- src/components/LoginForm.tsx
- src/services/authService.ts

Added:
- src/types/auth.ts

## Decisions Already Made

- Use JWT for authentication
- Store token in httpOnly cookie
- Implement refresh token rotation

## Constraints

- Must support both desktop and mobile browsers
- No external OAuth providers for MVP
- Token must expire in 24 hours

## Open Issues / Blockers

- CORS configuration needs review
- Token refresh endpoint not implemented

## Next Actions

- Implement token refresh endpoint
- Add error handling for expired tokens
- Write integration tests

## Important Rules

- Do not restart the analysis from zero
- Preserve existing architecture unless the context says otherwise
- Prioritize the next actions
- Ask clarifying questions only if required to avoid a risky implementation
```

Then just paste this into Claude and continue!

## Commands Reference

| Command | Shortcut | What it does |
|---------|----------|--------------|
| Create Context Package | `Ctrl+Shift+P` → search | Capture all context and generate exports |
| Export for Claude | `Ctrl+Shift+P` → search | Regenerate Claude handoff from saved context |
| Export for Codex | `Ctrl+Shift+P` → search | Regenerate Codex handoff from saved context |
| Export for Cursor | `Ctrl+Shift+P` → search | Regenerate Cursor handoff from saved context |
| Open Context File | `Ctrl+Shift+P` → search | Open `AI_CONTEXT.md` in editor |
| Refresh Git Context | `Ctrl+Shift+P` → search | Update git branch/changes in saved context |

## How It Works

### Architecture

ContextBridge uses a layered, service-based architecture:

```
Commands (User entry points)
    ↓
Services (Git, file I/O, export)
    ↓
Templates (Claude, Codex, Cursor, Generic)
    ↓
Output (.contextbridge/ directory)
```

**Services:**
- **Git Service** — Collects branch, modified files, diff summary
- **Context Store** — Persists context as YAML and Markdown
- **Export Service** — Renders templates and saves exports
- **Renderers** — Convert AIContext to YAML/Markdown/provider formats

**Templates:**
- Pure functions that convert AIContext → optimized prompts
- Easy to extend with new provider templates

### Data Model

All context flows through a single `AIContext` object:

```typescript
{
  version: "0.1.0",
  project: {
    name: "my-app",
    workspacePath: "/path/to/project",
    techStack: ["TypeScript", "React", "Node.js"]
  },
  git: {
    branch: "feature/auth-flow",
    modifiedFiles: ["src/auth.ts"],
    addedFiles: ["src/types/auth.ts"],
    deletedFiles: [],
    gitAvailable: true,
    diffSummary: "src/auth.ts | 50 ++++..."
  },
  currentGoal: "Implement user authentication",
  taskDescription: "Add JWT-based login/logout flow",
  files: [
    {
      path: "src/auth.ts",
      relevance: "high",
      reason: "Core auth logic",
      includeContent: false
    }
  ],
  decisions: ["Use JWT", "httpOnly cookies"],
  constraints: ["No external OAuth for MVP"],
  completedWork: ["Database schema"],
  openIssues: ["CORS configuration"],
  nextActions: ["Implement refresh endpoint"],
  createdAt: "2026-06-11T10:00:00Z",
  updatedAt: "2026-06-11T10:00:00Z"
}
```

## Privacy & Security

### What ContextBridge Does NOT Do

✓ **No cloud uploads** — Everything stays on your machine  
✓ **No telemetry** — No tracking, analytics, or logging to external servers  
✓ **No authentication** — No login required  
✓ **No API calls** — Completely offline-first  
✓ **No data storage** — Context only saved in `.contextbridge/` folder  

### What You Should Know

⚠️ **Exported prompts may contain sensitive data:**
- Source code snippets
- File paths and structure
- Decision rationale
- Technical constraints

**Before sharing exports:**
- Remove API keys, tokens, credentials
- Exclude proprietary algorithms
- Remove internal-only information
- Scrub customer/production data

**When including source code:**
- Only include code snippets if necessary for context
- Don't blindly include entire source files
- Review for hardcoded secrets before exporting

## Development

### Requirements

- Node.js 20+
- TypeScript 5+
- VS Code 1.90+

### Build

```bash
npm install
npm run compile      # Compile TypeScript to dist/
npm run watch        # Watch mode
npm test             # Run tests
```

### Testing

```bash
npm test             # Run all tests
npm test -- --watch # Watch mode

# Test suites:
# - gitService.test.ts (3 tests)
# - yamlRenderer.test.ts (3 tests)
# - markdownRenderer.test.ts (5 tests)
```

### Project Structure

```
src/
├── extension.ts                    # Entry point
├── commands/                       # VS Code commands
│   ├── createContextPackage.ts
│   ├── exportForClaude.ts
│   ├── exportForCodex.ts
│   ├── exportForCursor.ts
│   ├── openContextFile.ts
│   └── refreshGitContext.ts
├── services/                       # Core business logic
│   ├── gitService.ts
│   ├── contextStore.ts
│   ├── exportService.ts
│   ├── yamlRenderer.ts
│   └── markdownRenderer.ts
├── templates/                      # Provider-specific exports
│   ├── claudeTemplate.ts
│   ├── codexTemplate.ts
│   ├── cursorTemplate.ts
│   └── genericTemplate.ts
├── models/                         # TypeScript interfaces
│   └── aiContext.ts
└── utils/                          # Helpers
    ├── pathUtils.ts
    └── fsUtils.ts
```

## Roadmap

### v0.1 (Current — MVP)
- ✓ Create context package with git integration
- ✓ Export for Claude, Codex, Cursor, Generic
- ✓ Local file storage
- ✓ Quick-input UI for context entry

### v1.0 (Planned)
- Sidebar tree visualization
- Context quality scoring
- Edit context interactively
- Sensitive data detection/redaction warnings
- VS Code marketplace publication

### v2.0 (Future)
- Context history/versioning
- Team context templates
- Jira/GitHub issue integration
- MCP server integration
- Cloud sync (opt-in)

## Contributing

Contributions welcome! Areas for help:

- [ ] Sidebar tree view implementation
- [ ] Additional provider templates (ChatGPT, Gemini, etc.)
- [ ] Context quality scoring algorithm
- [ ] Sensitive data redaction
- [ ] Documentation and examples
- [ ] Testing improvements
- [ ] Performance optimization

## License

MIT — Use freely, modify as needed.

## Support

- **Issues:** [GitHub Issues](https://github.com/sharmapuneet1510/ai-context-bridge/issues)
- **Discussions:** [GitHub Discussions](https://github.com/sharmapuneet1510/ai-context-bridge/discussions)

## Made with ❤️

ContextBridge solves a real problem for AI-assisted development. Built with TypeScript, designed for developers who use multiple AI assistants.

---

**Ready to move your AI coding work seamlessly across assistants? Install ContextBridge and never start from zero again.**
