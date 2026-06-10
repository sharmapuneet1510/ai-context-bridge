# ContextBridge MVP Design

**Date:** 2026-06-10  
**Project:** ai-context-bridge  
**Scope:** VS Code extension for exporting AI coding context across providers

---

## Overview

ContextBridge is a VS Code extension that helps developers capture, compress, and export AI coding context (goals, decisions, constraints, open issues, next actions) so they can continue work across Claude, Codex, Cursor, Copilot, or any other AI assistant without losing context.

**MVP Priority:** Export-first. Focus on getting Claude/Codex/Cursor exports working perfectly. Sidebar visualization and polish come later.

---

## Architecture

### Layered Design

```
Commands (User entry points)
    ↓
Services (Core business logic, no UI)
    ├── contextStore (YAML/file I/O)
    ├── gitService (Git metadata)
    ├── fileSelectionService (File selection)
    └── exportService (Template rendering)
    ↓
Templates (Provider-specific prompts)
    ├── claudeTemplate.ts
    ├── codexTemplate.ts
    ├── cursorTemplate.ts
    └── genericTemplate.ts
    ↓
Output (.contextbridge/ directory)
```

**Rationale:**
- Services are stateless and reusable
- Templates are pure functions (easy to test)
- Commands are thin orchestrators
- All data flows through AIContext object
- Export pipeline is completely isolated from UI concerns

---

## Core Services

### contextStore.ts
**Responsibility:** Persist and retrieve context from disk

**Interface:**
```typescript
export async function loadContext(workspacePath: string): Promise<AIContext | null>;
export async function saveContext(context: AIContext): Promise<void>;
export async function ensureContextBridgeFolder(workspacePath: string): Promise<string>;
export async function writeExport(workspacePath: string, filename: string, content: string): Promise<void>;
```

**Details:**
- Ensure `.contextbridge/` folder exists
- Save `context.yaml` (via yamlRenderer)
- Save `AI_CONTEXT.md` (via markdownRenderer)
- Handle file permission errors gracefully

---

### gitService.ts
**Responsibility:** Collect Git metadata from workspace

**Interface:**
```typescript
export async function collectGitContext(workspacePath: string): Promise<GitContext>;
```

**Implementation:**
- Run `git branch --show-current` (current branch)
- Run `git status --short` (modified/added/deleted files)
- Run `git diff --stat` (line changes per file)
- If Git unavailable: return `{ gitAvailable: false, branch: undefined, ... }`

**Handles:**
- Git not installed
- Not in a Git repository
- Workspace not accessible

---

### fileSelectionService.ts
**Responsibility:** Let user select and tag relevant files

**Interface:**
```typescript
export async function selectFiles(workspacePath: string): Promise<ContextFile[]>;
```

**MVP Implementation:**
- Show quick-input: "Enter file paths (space-separated or one per line)"
- Parse input into ContextFile[] array
- Default all to relevance: "medium"
- User can edit `context.yaml` directly to adjust relevance levels

**Future:** Replace with file picker UI when sidebar is added

---

### exportService.ts
**Responsibility:** Render templates and save exports

**Interface:**
```typescript
export async function generateExport(
  context: AIContext,
  template: (context: AIContext) => string,
  filename: string
): Promise<void>;
```

**Details:**
- Accept a template function and AIContext
- Invoke template(context) to get rendered string
- Save to `.contextbridge/exports/{filename}`
- Show success/error message

---

### markdownRenderer.ts
**Responsibility:** Convert AIContext to human-readable Markdown

**Interface:**
```typescript
export function renderMarkdown(context: AIContext): string;
```

**Output:** `AI_CONTEXT.md` with sections:
- Project metadata
- Current goal
- Task description
- Relevant files (grouped by relevance)
- Git changes (branch, modified/added/deleted)
- Decisions
- Constraints
- Completed work
- Open issues
- Next actions
- Notes

---

### yamlRenderer.ts
**Responsibility:** Convert AIContext to machine-readable YAML

**Interface:**
```typescript
export function renderYaml(context: AIContext): string;
```

**Output:** `context.yaml` - structured data file matching AIContext interface

---

## File Structure

```
ai-context-bridge/
├── src/
│   ├── extension.ts                 // Entry point, VS Code activation
│   ├── commands/
│   │   ├── createContextPackage.ts  // Main command: collect input → save context → export all
│   │   ├── exportForClaude.ts       // Re-export Claude template to exports/
│   │   ├── exportForCodex.ts        
│   │   ├── exportForCursor.ts       
│   │   ├── openContextFile.ts       // Open .contextbridge/AI_CONTEXT.md in editor
│   │   └── refreshGitContext.ts     // Update git metadata
│   ├── services/
│   │   ├── contextStore.ts
│   │   ├── gitService.ts
│   │   ├── fileSelectionService.ts
│   │   ├── exportService.ts
│   │   ├── markdownRenderer.ts
│   │   └── yamlRenderer.ts
│   ├── templates/
│   │   ├── claudeTemplate.ts
│   │   ├── codexTemplate.ts
│   │   ├── cursorTemplate.ts
│   │   └── genericTemplate.ts
│   ├── models/
│   │   └── aiContext.ts             // TypeScript interfaces
│   └── utils/
│       ├── pathUtils.ts
│       ├── fsUtils.ts
│       └── validationUtils.ts
├── test/
│   ├── gitService.test.ts
│   ├── exportService.test.ts
│   └── markdownRenderer.test.ts
├── package.json
├── tsconfig.json
├── README.md
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-10-contextbridge-mvp-design.md
```

---

## Data Models

```typescript
export type RelevanceLevel = "high" | "medium" | "low" | "reference";

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

export interface ContextQualityResult {
  score: number;
  missing: string[];
}
```

---

## Command Flow: "Create Context Package"

**User runs:** `ContextBridge: Create Context Package`

### Step 1: Collect User Input
```
→ Quick-input: "Enter current goal"
→ Quick-input: "Enter task description"
→ Quick-input: "Enter constraints (one per line)"
→ Quick-input: "Enter decisions (one per line)"
→ Quick-input: "Enter completed work (one per line)"
→ Quick-input: "Enter open issues (one per line)"
→ Quick-input: "Enter next actions (one per line)"
```

### Step 2: Gather Project Metadata
```
→ Detect workspace name from workspacePath
→ Detect tech stack from files (package.json, tsconfig.json, etc.) — optional, can be edited later
→ gitService.collectGitContext(workspacePath)
```

### Step 3: Select Files
```
→ Quick-input: "Enter file paths (space-separated or one per line)"
→ Parse into ContextFile[] with default relevance "medium"
```

### Step 4: Build AIContext
```
→ Construct AIContext object with:
   - project (name, workspacePath, techStack)
   - git (from gitService)
   - User inputs (goal, task, decisions, constraints, etc.)
   - files (from selection)
   - timestamps (now)
```

### Step 5: Persist & Export
```
→ contextStore.ensureContextBridgeFolder(workspacePath)
→ contextStore.saveContext(context) // Writes context.yaml + AI_CONTEXT.md
→ exportService.generateExport(context, claudeTemplate, "claude_handoff.md")
→ exportService.generateExport(context, codexTemplate, "codex_handoff.md")
→ exportService.generateExport(context, cursorTemplate, "cursor_handoff.md")
→ exportService.generateExport(context, genericTemplate, "generic_handoff.md")
→ Show: "✓ Context package created in .contextbridge/"
```

---

## Export Pipeline

Each provider template is a pure function:

```typescript
export function claudeTemplate(context: AIContext): string {
  return `# Continue Existing Software Engineering Task\n\n...`;
}
```

**Export Service Flow:**
```
generateExport(context, template, filename)
  → result = template(context)
  → contextStore.writeExport(filename, result)
  → return success
```

**Provider Templates:**

### Claude Template
- Optimized for reasoning and continuation
- Emphasizes decisions, constraints, and next actions
- Includes "Important Rules" for Claude behavior
- Follows requirement Section 11

### Codex Template
- Action-oriented, code-generation focused
- Prioritizes high-relevance files
- Emphasizes implementation constraints and next steps
- Follows requirement Section 12

### Cursor Template
- Workspace-context format
- Suitable for composer prompts
- Includes file list and architectural constraints
- Follows requirement Section 13

### Generic Template
- Tool-neutral Markdown
- Portable across any AI assistant
- No provider-specific formatting
- Follows requirement Section 14

---

## Error Handling

### No workspace open
→ Show: "Open a workspace before creating a ContextBridge package."

### Git unavailable
→ Continue with `gitAvailable: false`. Show: "Git context unavailable. Continuing without Git metadata."

### File write failure
→ Show: "Failed to write ContextBridge files. Check workspace permissions."

### No files selected
→ Allow export. Show: "No files selected. Context may be weak for coding continuation."

---

## Security & Privacy

**Requirements (MVP):**
- No external API calls
- No telemetry
- No login/authentication
- All files stay in `.contextbridge/` directory
- Local-first only

**Implementation:**
- Commands run entirely in VS Code process
- File I/O is local only
- Git commands are local only
- Sensitive data warning: Show before including file content
  - Message: "You are about to include source code in the AI handoff. Make sure secrets, tokens, credentials, and production data are removed."

---

## Testing Strategy

### Unit Tests (priority)
- **gitService.test.ts** — Mock child_process, test Git output parsing
- **exportService.test.ts** — Test template rendering and file I/O
- **markdownRenderer.test.ts** — Test Markdown formatting
- **yamlRenderer.test.ts** — Test YAML serialization

### Integration Tests (future)
- End-to-end flow with real workspace
- File system operations
- Git integration

---

## Dependencies

### devDependencies
```json
{
  "@types/node": "^20.0.0",
  "@types/vscode": "^1.90.0",
  "typescript": "^5.0.0",
  "vsce": "^2.15.0"
}
```

### dependencies
```json
{
  "yaml": "^2.4.0"
}
```

**Rationale:**
- `yaml` for YAML serialization
- Minimal dependencies to keep extension lightweight
- Node built-ins for Git, file I/O

---

## Extension Configuration (package.json)

### Commands to Register
```json
{
  "contextbridge.createContextPackage": "ContextBridge: Create Context Package",
  "contextbridge.exportForClaude": "ContextBridge: Export for Claude",
  "contextbridge.exportForCodex": "ContextBridge: Export for Codex",
  "contextbridge.exportForCursor": "ContextBridge: Export for Cursor",
  "contextbridge.openContextFile": "ContextBridge: Open Context File",
  "contextbridge.refreshGitContext": "ContextBridge: Refresh Git Context"
}
```

### Sidebar/Tree View (MVP - simple version)
- No interactive tree for MVP
- Just add a sidebar command: "ContextBridge" → runs createContextPackage or opens context file

---

## Success Criteria (AC from Requirement)

✅ **AC-1:** `ContextBridge: Create Context Package` creates `.contextbridge/context.yaml` and `.contextbridge/AI_CONTEXT.md`

✅ **AC-2:** If Git repo, generated context includes branch, changed files, diff stat

✅ **AC-3:** User can export for Claude → creates `claude_handoff.md`

✅ **AC-4:** Codex export is concise, implementation-focused, includes objective/files/constraints/issues/steps

✅ **AC-5:** Sidebar shows project name, branch, goal, files, quality score (future iteration)

✅ **AC-6:** If Git unavailable, extension doesn't crash, saves with `gitAvailable: false`

✅ **AC-7:** Quality score reduces if next actions missing (future iteration)

---

## Implementation Path

**Phase 1 (MVP - Export Pipeline):**
1. Bootstrap extension + commands + types
2. Git service
3. Context store (YAML/Markdown)
4. Export service + templates (Claude first)
5. End-to-end test: Create context → export to Claude

**Phase 2 (Polish):**
1. Add Codex/Cursor/Generic exports
2. Improve file selection UX
3. Context quality score
4. Sensitive data warnings

**Phase 3 (Future):**
1. Sidebar tree view
2. Webview form for editing context
3. Context history
4. Advanced redaction

---

## Notes

- **Export is the ROI.** Get the export pipeline working end-to-end first.
- **Visualization is polish.** Tree view can wait until exports are proven.
- **Services are stateless.** All state lives in AIContext object.
- **Templates are functions.** Easy to add new providers, easy to test.
- **Keep it local.** No cloud, no APIs, no telemetry.
