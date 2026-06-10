# ai-context-bridge

## Full Project Requirement for Claude / Codex / Cursor

---

## 1. Product Name

**ai-context-bridge**

Display/marketing name: **ContextBridge**

---

## 2. One-line Description

**ai-context-bridge** is a VS Code extension that helps developers capture, visualize, compress, and export AI coding context so they can continue work across Codex, Claude, Cursor, Copilot, or any other AI assistant without starting from zero.

---

## 3. Problem Statement

Developers increasingly use multiple AI coding assistants. During long coding sessions, the AI context window often fills up, or the developer wants to switch to another provider.

Currently, when this happens, the developer must manually explain:

- What they were building
- Which files were involved
- What decisions were made
- What constraints exist
- What errors were seen
- What is already completed
- What should be done next

This is repetitive, lossy, and time-consuming.

**ai-context-bridge** solves this by generating a structured, provider-ready handoff package.

---

## 4. Target Users

### Primary User

Software developers using AI coding tools such as:

- Claude
- OpenAI Codex
- ChatGPT
- Cursor
- GitHub Copilot
- Gemini
- Local LLMs

### Secondary Users

Engineering leads and QA leads who want:

- Better AI usage discipline
- Repeatable context handoff
- Audit-friendly AI interaction records
- Team-level context templates

---

## 5. Core Value Proposition

**ai-context-bridge** helps developers move an AI coding session from one model/tool to another without losing context.

### User benefit

Instead of writing a long manual explanation, the user clicks one button and gets:

- A clean context summary
- Relevant files list
- Git diff summary
- Decisions made
- Constraints
- Open issues
- Next actions
- Provider-specific continuation prompts

---

## 6. MVP Scope

The MVP should be a **VS Code extension**.

It should work locally only.

No cloud account, no backend server, and no database are required for MVP.

---

## 7. MVP Goals

The MVP must allow the user to:

1. Create a project-level AI context snapshot.
2. Select files to include in the context.
3. Capture current Git branch and Git diff.
4. Add current task/goal manually.
5. Add blockers, decisions, and next actions manually.
6. Generate a structured `AI_CONTEXT.md`.
7. Generate provider-specific handoff prompts:
   - Claude
   - Codex
   - Cursor
   - Generic Markdown
8. Save generated files inside the project.
9. View a simple tree visualization of the context.

---

## 8. Non-goals for MVP

Do **not** build these in the first version:

- Cloud sync
- Login/authentication
- Team dashboard
- Browser extension
- Full chat import from Claude/Codex/ChatGPT
- Complex graph database
- Multi-user collaboration
- Real-time AI memory agent
- Paid billing system
- Heavy analytics

The MVP must stay local, lightweight, and demo-friendly.

---

## 9. High-level User Flow

### Flow 1: Create AI context package

1. User opens a project in VS Code.
2. User opens the ContextBridge panel.
3. User enters:
   - Current goal
   - Task description
   - Known constraints
   - Completed work
   - Open issues
   - Next actions
4. User selects files to include.
5. Extension reads:
   - Workspace name
   - Current Git branch
   - Git diff summary
   - Selected file paths
6. User clicks **Generate Context Package**.
7. Extension creates files under:

```text
.contextbridge/
  AI_CONTEXT.md
  context.yaml
  exports/
    claude_handoff.md
    codex_handoff.md
    cursor_handoff.md
    generic_handoff.md
```

---

### Flow 2: Export for Claude

1. User opens the ContextBridge panel.
2. User clicks **Export for Claude**.
3. Extension generates a Claude-specific prompt.
4. User copies the prompt.
5. User pastes it into Claude and continues work.

---

### Flow 3: View context tree

1. User opens the ContextBridge sidebar.
2. User sees a tree view:

```text
ContextBridge
├── Project
├── Current Goal
├── Files
├── Git Changes
├── Decisions
├── Constraints
├── Open Issues
└── Next Actions
```

3. User can inspect and edit context sections.

---

## 10. Functional Requirements

### FR-1: VS Code extension activation

The extension must activate when:

- A workspace is opened
- The user runs a ContextBridge command
- The ContextBridge sidebar is opened

Commands required:

```text
ContextBridge: Create Context Package
ContextBridge: Export for Claude
ContextBridge: Export for Codex
ContextBridge: Export for Cursor
ContextBridge: Open Context File
ContextBridge: Refresh Git Context
```

---

### FR-2: Sidebar panel

The extension must provide a sidebar panel named:

```text
ContextBridge
```

The sidebar must show:

- Project name
- Current Git branch
- Current goal
- Selected files
- Decisions
- Constraints
- Completed work
- Open issues
- Next actions
- Export actions

---

### FR-3: Manual context input

The user must be able to enter/edit the following fields:

```yaml
current_goal:
task_description:
constraints:
decisions:
completed_work:
open_issues:
next_actions:
notes:
```

Each field should support plain text.

For list fields, allow one item per line.

---

### FR-4: File selection

The extension must allow the user to select files from the workspace.

The user should be able to mark each selected file as:

```text
high relevance
medium relevance
low relevance
reference only
```

Each selected file should include:

```yaml
path:
relevance:
reason:
include_content:
```

For MVP, `include_content` can default to `false`.

The MVP should include file paths and optional snippets, but it should not blindly dump full source code unless the user chooses to include content.

---

### FR-5: Git context collection

The extension must detect Git metadata from the current workspace.

Required Git data:

```yaml
branch:
modified_files:
added_files:
deleted_files:
renamed_files:
diff_summary:
```

The extension should run local Git commands:

```bash
git branch --show-current
git status --short
git diff --stat
git diff --name-only
```

If Git is unavailable, the extension should still work and show:

```text
Git context unavailable
```

---

### FR-6: Context file generation

The extension must generate:

```text
.contextbridge/context.yaml
.contextbridge/AI_CONTEXT.md
```

The YAML file should be machine-readable.

The Markdown file should be human-readable.

---

### FR-7: Provider-specific exports

The extension must generate these files:

```text
.contextbridge/exports/claude_handoff.md
.contextbridge/exports/codex_handoff.md
.contextbridge/exports/cursor_handoff.md
.contextbridge/exports/generic_handoff.md
```

Each export should use the same core context but different formatting.

---

## 11. Claude Export Requirement

The Claude handoff must be optimized for reasoning, constraints, and continuation.

### Claude export template

```md
# Continue Existing Software Engineering Task

You are continuing an existing software engineering task. Use the context below as the source of truth.

## Project

Project name: {{project_name}}

Tech stack:
{{tech_stack}}

Current Git branch:
{{git_branch}}

## Current Goal

{{current_goal}}

## Task Description

{{task_description}}

## Relevant Files

{{relevant_files}}

## Git Changes Summary

{{git_summary}}

## Decisions Already Made

{{decisions}}

## Constraints

{{constraints}}

## Completed Work

{{completed_work}}

## Open Issues / Blockers

{{open_issues}}

## Next Actions

{{next_actions}}

## Important Rules

- Do not restart the analysis from zero.
- Do not ask for information that is already provided above.
- Preserve existing architecture unless the context says otherwise.
- Prioritize the next actions.
- Ask clarifying questions only if required to avoid a risky implementation.
- If code is needed, explain which files should change and why.
- Keep output practical and implementation-focused.

## Expected Output

Continue from the current state and help complete the next implementation step.
```

---

## 12. Codex Export Requirement

The Codex export must be action-oriented and code-generation focused.

### Codex export template

```md
# Coding Task Continuation

Continue the following coding task using the project context below.

## Objective

{{current_goal}}

## Files to Focus On

{{high_relevance_files}}

## Current Git Context

Branch:
{{git_branch}}

Changed files:
{{changed_files}}

## Implementation Constraints

{{constraints}}

## Decisions Already Made

{{decisions}}

## Known Issues

{{open_issues}}

## Required Next Steps

{{next_actions}}

## Coding Rules

- Make minimal necessary changes.
- Follow existing project style.
- Do not change public APIs unless explicitly required.
- Do not modify unrelated files.
- Add or update tests if relevant.
- Explain the changed files after implementation.

## Expected Output

Implement the next step based on the context above.
```

---

## 13. Cursor Export Requirement

The Cursor export must be useful as a workspace-level instruction or composer prompt.

### Cursor export template

```md
# ContextBridge Workspace Context

Use this as the working context for the current coding session.

## Goal

{{current_goal}}

## Relevant Project Files

{{relevant_files}}

## Architecture / Technical Constraints

{{constraints}}

## Current Work State

Completed:
{{completed_work}}

Pending:
{{next_actions}}

Blocked:
{{open_issues}}

## Decisions

{{decisions}}

## Cursor Instructions

- Use the listed files as primary context.
- Do not scan unrelated parts of the repository unless needed.
- Prefer small, reviewable changes.
- Follow the existing code style.
- Ask before making large architectural changes.
```

---

## 14. Generic Markdown Export Requirement

The generic export should be tool-neutral.

```md
# AI Context Handoff

## Project

{{project_name}}

## Current Goal

{{current_goal}}

## Summary

{{task_description}}

## Relevant Files

{{relevant_files}}

## Current Git State

{{git_summary}}

## Decisions

{{decisions}}

## Constraints

{{constraints}}

## Completed

{{completed_work}}

## Open Issues

{{open_issues}}

## Next Actions

{{next_actions}}

## Notes

{{notes}}
```

---

## 15. Data Model

Use the following TypeScript interfaces.

```ts
export type RelevanceLevel =
  | "high"
  | "medium"
  | "low"
  | "reference";

export interface ContextFile {
  path: string;
  relevance: RelevanceLevel;
  reason?: string;
  includeContent: boolean;
  contentSnippet?: string;
}

export interface GitContext {
  branch?: string;
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  renamedFiles: string[];
  diffSummary?: string;
  gitAvailable: boolean;
}

export interface AIContext {
  version: string;

  project: {
    name: string;
    workspacePath: string;
    techStack: string[];
  };

  git: GitContext;

  currentGoal: string;
  taskDescription: string;

  files: ContextFile[];

  decisions: string[];
  constraints: string[];
  completedWork: string[];
  openIssues: string[];
  nextActions: string[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
}
```

---

## 16. File Structure

The extension source code should follow this structure:

```text
ai-context-bridge/
  package.json
  tsconfig.json
  README.md

  src/
    extension.ts

    commands/
      createContextPackage.ts
      exportForClaude.ts
      exportForCodex.ts
      exportForCursor.ts
      openContextFile.ts
      refreshGitContext.ts

    services/
      contextStore.ts
      gitService.ts
      fileSelectionService.ts
      exportService.ts
      markdownRenderer.ts
      yamlRenderer.ts
      workspaceService.ts
      contextQualityService.ts

    providers/
      contextTreeProvider.ts
      contextWebviewProvider.ts

    templates/
      claudeTemplate.ts
      codexTemplate.ts
      cursorTemplate.ts
      genericTemplate.ts

    models/
      aiContext.ts

    utils/
      fsUtils.ts
      pathUtils.ts
      dateUtils.ts
      validationUtils.ts

  media/
    main.css
    main.js

  test/
    gitService.test.ts
    exportService.test.ts
    markdownRenderer.test.ts
```

---

## 17. UI Requirement

### Sidebar tree

The tree should show:

```text
ContextBridge
├── Project: {{project_name}}
├── Branch: {{branch}}
├── Goal
├── Files
│   ├── High relevance
│   ├── Medium relevance
│   ├── Low relevance
│   └── Reference only
├── Git Changes
├── Decisions
├── Constraints
├── Completed Work
├── Open Issues
└── Next Actions
```

### Actions

The sidebar should provide buttons or command links:

```text
Create Context Package
Export for Claude
Export for Codex
Export for Cursor
Open AI_CONTEXT.md
Refresh Git Context
```

---

## 18. Context Quality Score

Add a simple context quality score.

The score should be calculated out of 100.

### Scoring rules

```text
Current goal present: +20
Task description present: +15
At least one relevant file selected: +15
Git context available: +10
At least one constraint listed: +10
At least one next action listed: +15
At least one open issue or completed item listed: +10
Provider export generated: +5
```

### Score display

Example:

```text
Context Quality: 75/100

Missing:
- No constraints listed
- No next actions listed
```

This should help the user improve the handoff before exporting.

---

## 19. Security and Privacy Requirements

The MVP must be local-first.

### Required

- Do not upload code anywhere.
- Do not call external APIs.
- Do not send telemetry.
- Do not require login.
- Do not store data outside the workspace.
- All generated files must stay under `.contextbridge/`.

### Sensitive data warning

Before exporting file content, show warning:

```text
You are about to include source code or logs in the AI handoff. Make sure secrets, tokens, credentials, and production data are removed.
```

### Optional MVP redaction

Basic string pattern detection for:

- API keys
- Bearer tokens
- Password assignments
- `.env` files
- Private keys
- AWS keys
- GitHub tokens

For MVP, it is acceptable to show a warning instead of full automatic redaction.

---

## 20. Error Handling Requirements

### No workspace open

Show:

```text
Open a workspace before creating a ContextBridge package.
```

### Git unavailable

Show:

```text
Git context is unavailable. ContextBridge will continue without Git metadata.
```

### No files selected

Allow export but show warning:

```text
No relevant files selected. The exported context may be too weak for coding continuation.
```

### File write failure

Show:

```text
Failed to write ContextBridge files. Check workspace permissions.
```

---

## 21. Acceptance Criteria

### AC-1

Given a VS Code workspace is open, when the user runs:

```text
ContextBridge: Create Context Package
```

Then the extension creates:

```text
.contextbridge/context.yaml
.contextbridge/AI_CONTEXT.md
```

---

### AC-2

Given the workspace is a Git repository, when the context package is created, then the generated context includes:

- current branch
- changed files
- git diff stat

---

### AC-3

Given the user has entered a current goal and selected files, when they export for Claude, then the extension creates:

```text
.contextbridge/exports/claude_handoff.md
```

---

### AC-4

Given the user exports for Codex, then the generated prompt should be concise, implementation-focused, and include:

- objective
- files to focus on
- constraints
- known issues
- next steps

---

### AC-5

Given the user opens the ContextBridge sidebar, then they can see:

- project name
- branch
- goal
- selected files
- quality score
- export actions

---

### AC-6

Given Git is unavailable, the extension should not crash.

It should still generate context files with:

```yaml
gitAvailable: false
```

---

### AC-7

Given the user has no next actions listed, the quality score should reduce and show a missing-item warning.

---

## 22. Implementation Plan

### Step 1: Bootstrap extension

Create a VS Code extension using TypeScript.

Required dependencies:

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.90.0",
    "typescript": "^5.0.0",
    "vsce": "^2.15.0"
  },
  "dependencies": {
    "yaml": "^2.4.0"
  }
}
```

---

### Step 2: Add commands

Register the following commands in `package.json`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "contextbridge.createContextPackage",
        "title": "ContextBridge: Create Context Package"
      },
      {
        "command": "contextbridge.exportForClaude",
        "title": "ContextBridge: Export for Claude"
      },
      {
        "command": "contextbridge.exportForCodex",
        "title": "ContextBridge: Export for Codex"
      },
      {
        "command": "contextbridge.exportForCursor",
        "title": "ContextBridge: Export for Cursor"
      },
      {
        "command": "contextbridge.openContextFile",
        "title": "ContextBridge: Open Context File"
      },
      {
        "command": "contextbridge.refreshGitContext",
        "title": "ContextBridge: Refresh Git Context"
      }
    ]
  }
}
```

---

### Step 3: Implement Git service

Create `gitService.ts`.

It should expose:

```ts
export async function collectGitContext(workspacePath: string): Promise<GitContext>;
```

Internally it should run:

```bash
git branch --show-current
git status --short
git diff --stat
```

Use Node `child_process`.

---

### Step 4: Implement context store

Create `contextStore.ts`.

It should:

- Create `.contextbridge/` folder if missing
- Save `context.yaml`
- Load existing `context.yaml`
- Update fields
- Save generated exports

---

### Step 5: Implement renderers

Create:

```text
markdownRenderer.ts
yamlRenderer.ts
```

The Markdown renderer should generate the human-readable `AI_CONTEXT.md`.

The YAML renderer should generate machine-readable context.

---

### Step 6: Implement provider templates

Create:

```text
claudeTemplate.ts
codexTemplate.ts
cursorTemplate.ts
genericTemplate.ts
```

Each template should accept:

```ts
AIContext
```

and return:

```ts
string
```

---

### Step 7: Implement context quality score

Create:

```text
contextQualityService.ts
```

It should return:

```ts
export interface ContextQualityResult {
  score: number;
  missing: string[];
}
```

---

### Step 8: Implement sidebar tree

Create:

```text
contextTreeProvider.ts
```

Use VS Code `TreeDataProvider`.

---

### Step 9: Add README

README should explain:

- What ContextBridge does
- Why it exists
- How to use it
- Where files are generated
- Privacy model
- Example Claude export

---

## 23. Example Generated `context.yaml`

```yaml
version: "0.1.0"

project:
  name: "ai-context-bridge"
  workspacePath: "/Users/puneet/projects/ai-context-bridge"
  techStack:
    - TypeScript
    - VS Code Extension API
    - Node.js

git:
  branch: "feature/context-export"
  gitAvailable: true
  modifiedFiles:
    - "src/extension.ts"
    - "src/services/gitService.ts"
  addedFiles:
    - "src/templates/claudeTemplate.ts"
  deletedFiles: []
  renamedFiles: []
  diffSummary: |
    src/extension.ts | 80 +++++++++++++++++++++
    src/services/gitService.ts | 45 +++++++++++
    src/templates/claudeTemplate.ts | 60 ++++++++++++++

currentGoal: "Create a VS Code extension that exports AI coding context for Claude, Codex, Cursor, and other assistants."

taskDescription: "Build a local-first extension that captures project goal, relevant files, Git metadata, decisions, constraints, blockers, completed work, and next actions, then exports provider-specific handoff prompts."

files:
  - path: "src/extension.ts"
    relevance: "high"
    reason: "Main extension activation and command registration file."
    includeContent: false
  - path: "src/services/gitService.ts"
    relevance: "high"
    reason: "Collects Git branch, status, and diff summary."
    includeContent: false
  - path: "src/templates/claudeTemplate.ts"
    relevance: "high"
    reason: "Generates Claude-specific handoff prompt."
    includeContent: false

decisions:
  - "Build as a VS Code extension for the first MVP."
  - "Keep all data local under .contextbridge/."
  - "Do not call external APIs in MVP."
  - "Generate provider-specific Markdown exports."

constraints:
  - "No cloud sync in MVP."
  - "No login or authentication."
  - "No telemetry."
  - "Do not blindly include full source code unless user chooses to include it."

completedWork:
  - "Project requirement defined."
  - "MVP scope finalized."
  - "Provider export templates specified."

openIssues:
  - "Need to implement file selection UX."
  - "Need to implement context quality score."
  - "Need to decide whether to include optional source snippets."

nextActions:
  - "Bootstrap VS Code extension project."
  - "Create TypeScript interfaces."
  - "Implement Git context collection service."
  - "Implement context.yaml and AI_CONTEXT.md generation."
  - "Implement Claude export template first."

notes: "Export is the ROI. Visualization should come after the export flow works."

createdAt: "2026-06-10T10:00:00.000Z"
updatedAt: "2026-06-10T10:00:00.000Z"
```

---

## 24. Example Generated Claude Handoff

```md
# Continue Existing Software Engineering Task

You are continuing an existing software engineering task. Use the context below as the source of truth.

## Project

Project name: ai-context-bridge

Tech stack:
- TypeScript
- VS Code Extension API
- Node.js

Current Git branch:
feature/context-export

## Current Goal

Create a VS Code extension that exports AI coding context for Claude, Codex, Cursor, and other assistants.

## Task Description

Build a local-first extension that captures project goal, relevant files, Git metadata, decisions, constraints, blockers, completed work, and next actions, then exports provider-specific handoff prompts.

## Relevant Files

High relevance:
- src/extension.ts — Main extension activation and command registration file.
- src/services/gitService.ts — Collects Git branch, status, and diff summary.
- src/templates/claudeTemplate.ts — Generates Claude-specific handoff prompt.

## Git Changes Summary

Modified:
- src/extension.ts
- src/services/gitService.ts

Added:
- src/templates/claudeTemplate.ts

Diff summary:
src/extension.ts | 80 +++++++++++++++++++++
src/services/gitService.ts | 45 +++++++++++
src/templates/claudeTemplate.ts | 60 ++++++++++++++

## Decisions Already Made

- Build as a VS Code extension for the first MVP.
- Keep all data local under .contextbridge/.
- Do not call external APIs in MVP.
- Generate provider-specific Markdown exports.

## Constraints

- No cloud sync in MVP.
- No login or authentication.
- No telemetry.
- Do not blindly include full source code unless user chooses to include it.

## Completed Work

- Project requirement defined.
- MVP scope finalized.
- Provider export templates specified.

## Open Issues / Blockers

- Need to implement file selection UX.
- Need to implement context quality score.
- Need to decide whether to include optional source snippets.

## Next Actions

- Bootstrap VS Code extension project.
- Create TypeScript interfaces.
- Implement Git context collection service.
- Implement context.yaml and AI_CONTEXT.md generation.
- Implement Claude export template first.

## Important Rules

- Do not restart the analysis from zero.
- Do not ask for information that is already provided above.
- Preserve existing architecture unless the context says otherwise.
- Prioritize the next actions.
- Ask clarifying questions only if required to avoid a risky implementation.
- If code is needed, explain which files should change and why.
- Keep output practical and implementation-focused.

## Expected Output

Continue from the current state and help complete the next implementation step.
```

---

## 25. Suggested First Prompt for Claude

Paste this into Claude:

```md
I want you to build a VS Code extension project called ai-context-bridge.

The display/marketing name is ContextBridge.

ai-context-bridge is a local-first VS Code extension that helps developers capture, visualize, compress, and export AI coding context so they can continue work across Claude, Codex, Cursor, Copilot, or any AI assistant without starting from zero.

Use the full requirement below as the source of truth.

Build the project incrementally.

First, generate:
1. The recommended project structure.
2. The package.json.
3. The tsconfig.json.
4. The main extension.ts.
5. The core TypeScript interfaces.
6. The Git context collection service.
7. The context export service.
8. The Claude export template.

Do not build cloud features.
Do not use external APIs.
Keep everything local-first.
Prioritize a working MVP over perfect architecture.

Here is the requirement:

[PASTE THIS FULL REQUIREMENT]
```

---

## 26. Recommended First Build

Start with this exact MVP:

```text
ai-context-bridge v0.1
├── VS Code command
├── Git context reader
├── Manual goal input
├── Selected files list
├── context.yaml
├── AI_CONTEXT.md
└── claude_handoff.md
```

Do **not** start with the visual graph.

The export is the ROI.

The visualization is the polish.

---

## 27. Product Positioning

Weak positioning:

> A tool to visualize AI memory.

Strong positioning:

> A one-click handoff system that lets developers continue AI coding work across Codex, Claude, Cursor, and Copilot without losing context.

Best tagline:

> Move your AI coding session from one model to another without starting over.

---

## 28. Future Roadmap

### Phase 1: Local context exporter

- Manual notes panel
- Detect open files
- Detect selected files
- Detect Git diff
- Generate AI_CONTEXT.md
- Generate Claude/Codex/Cursor prompt

### Phase 2: Context visualizer

- Tree view of goals, files, decisions, issues, and next actions
- Edit context before export
- Remove sensitive data

### Phase 3: Smart memory extraction

- Extract decisions
- Extract constraints
- Extract blockers
- Extract unresolved questions
- Deduplicate repeated context
- Compress long context

### Phase 4: Team/enterprise version

- Context history
- Export audit log
- Redaction rules
- Repo-specific templates
- Team instruction packs
- MCP server integration
- Jira/GitLab integration

---

## 29. Key Risks and Mitigations

### Risk 1: AI providers add their own export feature

Mitigation:

Build cross-provider structured context, not provider-specific chat export.

---

### Risk 2: Context becomes noisy

Mitigation:

Add relevance ranking:

- High relevance
- Medium relevance
- Low relevance
- Reference only
- Exclude

---

### Risk 3: Sensitive data leakage

Mitigation:

Add warnings and optional redaction for:

- API keys
- Credentials
- Customer IDs
- Emails
- Internal URLs
- Secrets
- Production data

---

### Risk 4: Visualization becomes a distraction

Mitigation:

Use visualization only to help users inspect and edit export context.

The export flow must remain the core value.

---

### Risk 5: Too much manual input

Mitigation:

Auto-detect what is practical, then ask only for:

1. Current goal
2. What changed
3. What the next AI should do

---

## 30. Final Product Principle

**ai-context-bridge should not be a fancy memory graph first.**

It should first be a practical engineering handoff tool.

The fastest valuable version is:

> Select files → capture Git context → add goal → export Claude/Codex/Cursor handoff.

Everything else comes later.

