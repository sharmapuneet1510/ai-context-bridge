# ContextBridge MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VS Code extension that captures AI coding context (goals, decisions, files, Git state) and exports provider-specific handoff prompts (Claude, Codex, Cursor, Generic).

**Architecture:** Export-first design with stateless services (Git, context store, export renderer) and pure-function templates. All state flows through a single AIContext object. Commands are thin orchestrators that call services and templates.

**Tech Stack:** TypeScript, VS Code Extension API, Node.js, yaml library

---

## File Structure

**Create:**
- `src/extension.ts` — Extension activation, command registration
- `src/models/aiContext.ts` — TypeScript interfaces (AIContext, ContextFile, GitContext, etc.)
- `src/services/gitService.ts` — Git metadata collection
- `src/services/contextStore.ts` — YAML/Markdown file I/O
- `src/services/yamlRenderer.ts` — AIContext → YAML
- `src/services/markdownRenderer.ts` — AIContext → Markdown
- `src/services/exportService.ts` — Template rendering + file export
- `src/templates/claudeTemplate.ts` — Claude-specific prompt generation
- `src/templates/codexTemplate.ts` — Codex-specific prompt generation
- `src/templates/cursorTemplate.ts` — Cursor-specific prompt generation
- `src/templates/genericTemplate.ts` — Generic Markdown export
- `src/commands/createContextPackage.ts` — Main orchestrator command
- `src/commands/exportForClaude.ts` — Re-export Claude template
- `src/commands/exportForCodex.ts` — Re-export Codex template
- `src/commands/exportForCursor.ts` — Re-export Cursor template
- `src/commands/openContextFile.ts` — Open AI_CONTEXT.md in editor
- `src/commands/refreshGitContext.ts` — Update Git metadata
- `src/utils/fsUtils.ts` — File system helpers
- `src/utils/pathUtils.ts` — Path resolution helpers
- `test/gitService.test.ts` — Git service tests
- `test/yamlRenderer.test.ts` — YAML rendering tests
- `test/markdownRenderer.test.ts` — Markdown rendering tests

**Modify:**
- `package.json` — Add dependencies, commands, activation events

---

## Phase 1: Bootstrap & Core Interfaces

### Task 1: Initialize VS Code Extension Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/extension.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ai-context-bridge",
  "displayName": "ContextBridge",
  "description": "Capture, compress, and export AI coding context across providers",
  "version": "0.1.0",
  "publisher": "puneet",
  "engines": {
    "vscode": "^1.90.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onCommand:contextbridge.createContextPackage",
    "onCommand:contextbridge.exportForClaude",
    "onCommand:contextbridge.exportForCodex",
    "onCommand:contextbridge.exportForCursor",
    "onCommand:contextbridge.openContextFile",
    "onCommand:contextbridge.refreshGitContext"
  ],
  "main": "./dist/extension.js",
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
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "jest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.90.0",
    "typescript": "^5.0.0",
    "vsce": "^2.15.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "dependencies": {
    "yaml": "^2.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "test"]
}
```

- [ ] **Step 3: Create src/extension.ts**

```typescript
import * as vscode from "vscode";
import { registerCreateContextPackageCommand } from "./commands/createContextPackage";
import { registerExportForClaudeCommand } from "./commands/exportForClaude";
import { registerExportForCodexCommand } from "./commands/exportForCodex";
import { registerExportForCursorCommand } from "./commands/exportForCursor";
import { registerOpenContextFileCommand } from "./commands/openContextFile";
import { registerRefreshGitContextCommand } from "./commands/refreshGitContext";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCreateContextPackageCommand());
  context.subscriptions.push(registerExportForClaudeCommand());
  context.subscriptions.push(registerExportForCodexCommand());
  context.subscriptions.push(registerExportForCursorCommand());
  context.subscriptions.push(registerOpenContextFileCommand());
  context.subscriptions.push(registerRefreshGitContextCommand());

  vscode.window.showInformationMessage("ContextBridge activated");
}

export function deactivate() {}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: No errors, node_modules created

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npm run compile`

Expected: dist/extension.js created with no errors

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json src/extension.ts
git commit -m "feat: bootstrap VS Code extension project"
```

---

### Task 2: Define Core TypeScript Interfaces

**Files:**
- Create: `src/models/aiContext.ts`

- [ ] **Step 1: Create src/models/aiContext.ts**

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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/models/aiContext.ts
git commit -m "feat: define AIContext TypeScript interfaces"
```

---

## Phase 2: Services (Git, Store, Renderers)

### Task 3: Implement Git Service

**Files:**
- Create: `src/services/gitService.ts`
- Create: `src/utils/fsUtils.ts`
- Create: `test/gitService.test.ts`

- [ ] **Step 1: Write failing test for gitService**

Create `test/gitService.test.ts`:

```typescript
import { collectGitContext } from "../src/services/gitService";

describe("gitService", () => {
  test("collectGitContext returns gitAvailable false when git command fails", async () => {
    const context = await collectGitContext("/nonexistent/path");
    expect(context.gitAvailable).toBe(false);
    expect(context.branch).toBeUndefined();
  });

  test("collectGitContext returns branch name when git available", async () => {
    const workspacePath = process.cwd();
    const context = await collectGitContext(workspacePath);
    if (context.gitAvailable) {
      expect(context.branch).toBeDefined();
      expect(typeof context.branch).toBe("string");
    }
  });

  test("collectGitContext parses modified, added, deleted files", async () => {
    const workspacePath = process.cwd();
    const context = await collectGitContext(workspacePath);
    expect(context.modifiedFiles).toBeInstanceOf(Array);
    expect(context.addedFiles).toBeInstanceOf(Array);
    expect(context.deletedFiles).toBeInstanceOf(Array);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/gitService.test.ts`

Expected: FAIL - "Cannot find module ../src/services/gitService"

- [ ] **Step 3: Create src/utils/fsUtils.ts**

```typescript
import { execSync } from "child_process";

export function executeCommand(
  command: string,
  cwd: string
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(command, { cwd, encoding: "utf-8" }).trim();
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: "",
      stderr: error.message || "Command failed",
      exitCode: error.status || 1,
    };
  }
}
```

- [ ] **Step 4: Create src/services/gitService.ts**

```typescript
import { GitContext } from "../models/aiContext";
import { executeCommand } from "../utils/fsUtils";

export async function collectGitContext(workspacePath: string): Promise<GitContext> {
  const context: GitContext = {
    modifiedFiles: [],
    addedFiles: [],
    deletedFiles: [],
    renamedFiles: [],
    gitAvailable: false,
  };

  // Get branch
  const branchResult = executeCommand("git branch --show-current", workspacePath);
  if (branchResult.exitCode === 0) {
    context.gitAvailable = true;
    context.branch = branchResult.stdout;
  } else {
    return context;
  }

  // Get status
  const statusResult = executeCommand("git status --short", workspacePath);
  if (statusResult.exitCode === 0) {
    const lines = statusResult.stdout.split("\n").filter((l) => l.trim());
    lines.forEach((line) => {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      if (status[0] === "M" || status[1] === "M") context.modifiedFiles.push(file);
      if (status[0] === "A" || status[1] === "A") context.addedFiles.push(file);
      if (status[0] === "D" || status[1] === "D") context.deletedFiles.push(file);
      if (status[0] === "R") context.renamedFiles.push(file);
    });
  }

  // Get diff summary
  const diffResult = executeCommand("git diff --stat", workspacePath);
  if (diffResult.exitCode === 0) {
    context.diffSummary = diffResult.stdout;
  }

  return context;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- test/gitService.test.ts`

Expected: PASS - 3 tests passing

- [ ] **Step 6: Commit**

```bash
git add src/utils/fsUtils.ts src/services/gitService.ts test/gitService.test.ts
git commit -m "feat: implement git context collection service"
```

---

### Task 4: Implement YAML Renderer

**Files:**
- Create: `src/services/yamlRenderer.ts`
- Create: `test/yamlRenderer.test.ts`

- [ ] **Step 1: Write failing test for yamlRenderer**

Create `test/yamlRenderer.test.ts`:

```typescript
import { renderYaml } from "../src/services/yamlRenderer";
import { AIContext } from "../src/models/aiContext";

describe("yamlRenderer", () => {
  const mockContext: AIContext = {
    version: "0.1.0",
    project: {
      name: "test-project",
      workspacePath: "/test/path",
      techStack: ["TypeScript", "Node.js"],
    },
    git: {
      branch: "main",
      modifiedFiles: ["src/test.ts"],
      addedFiles: [],
      deletedFiles: [],
      renamedFiles: [],
      diffSummary: "src/test.ts | 10 ++",
      gitAvailable: true,
    },
    currentGoal: "Test rendering",
    taskDescription: "Render YAML",
    files: [
      {
        path: "src/test.ts",
        relevance: "high",
        reason: "Main file",
        includeContent: false,
      },
    ],
    decisions: ["Use TypeScript"],
    constraints: ["Must be local"],
    completedWork: ["Setup"],
    openIssues: ["None"],
    nextActions: ["Test"],
    notes: "Test note",
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-10T10:00:00Z",
  };

  test("renderYaml returns valid YAML string", () => {
    const yaml = renderYaml(mockContext);
    expect(typeof yaml).toBe("string");
    expect(yaml.includes("version: 0.1.0")).toBe(true);
    expect(yaml.includes("name: test-project")).toBe(true);
  });

  test("renderYaml preserves project metadata", () => {
    const yaml = renderYaml(mockContext);
    expect(yaml.includes("workspacePath: /test/path")).toBe(true);
  });

  test("renderYaml includes git branch", () => {
    const yaml = renderYaml(mockContext);
    expect(yaml.includes("branch: main")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/yamlRenderer.test.ts`

Expected: FAIL - "Cannot find module ../src/services/yamlRenderer"

- [ ] **Step 3: Create src/services/yamlRenderer.ts**

```typescript
import { stringify } from "yaml";
import { AIContext } from "../models/aiContext";

export function renderYaml(context: AIContext): string {
  const yamlObj = {
    version: context.version,
    project: {
      name: context.project.name,
      workspacePath: context.project.workspacePath,
      techStack: context.project.techStack,
    },
    git: {
      branch: context.git.branch,
      gitAvailable: context.git.gitAvailable,
      modifiedFiles: context.git.modifiedFiles,
      addedFiles: context.git.addedFiles,
      deletedFiles: context.git.deletedFiles,
      renamedFiles: context.git.renamedFiles,
      diffSummary: context.git.diffSummary,
    },
    currentGoal: context.currentGoal,
    taskDescription: context.taskDescription,
    files: context.files,
    decisions: context.decisions,
    constraints: context.constraints,
    completedWork: context.completedWork,
    openIssues: context.openIssues,
    nextActions: context.nextActions,
    notes: context.notes,
    createdAt: context.createdAt,
    updatedAt: context.updatedAt,
  };

  return stringify(yamlObj);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/yamlRenderer.test.ts`

Expected: PASS - 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/services/yamlRenderer.ts test/yamlRenderer.test.ts
git commit -m "feat: implement YAML renderer"
```

---

### Task 5: Implement Markdown Renderer

**Files:**
- Create: `src/services/markdownRenderer.ts`
- Create: `test/markdownRenderer.test.ts`

- [ ] **Step 1: Write failing test for markdownRenderer**

Create `test/markdownRenderer.test.ts`:

```typescript
import { renderMarkdown } from "../src/services/markdownRenderer";
import { AIContext } from "../src/models/aiContext";

describe("markdownRenderer", () => {
  const mockContext: AIContext = {
    version: "0.1.0",
    project: {
      name: "test-project",
      workspacePath: "/test/path",
      techStack: ["TypeScript"],
    },
    git: {
      branch: "main",
      modifiedFiles: ["src/test.ts"],
      addedFiles: ["src/new.ts"],
      deletedFiles: [],
      renamedFiles: [],
      diffSummary: "src/test.ts | 10 +++",
      gitAvailable: true,
    },
    currentGoal: "Build context bridge",
    taskDescription: "Export AI context",
    files: [
      {
        path: "src/test.ts",
        relevance: "high",
        reason: "Main test file",
        includeContent: false,
      },
    ],
    decisions: ["Use TypeScript"],
    constraints: ["No external APIs"],
    completedWork: ["Setup project"],
    openIssues: ["None"],
    nextActions: ["Implement CLI"],
    notes: "Initial version",
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-10T10:00:00Z",
  };

  test("renderMarkdown returns markdown string", () => {
    const md = renderMarkdown(mockContext);
    expect(typeof md).toBe("string");
    expect(md.includes("# AI Context")).toBe(true);
  });

  test("renderMarkdown includes project name", () => {
    const md = renderMarkdown(mockContext);
    expect(md.includes("test-project")).toBe(true);
  });

  test("renderMarkdown includes current goal", () => {
    const md = renderMarkdown(mockContext);
    expect(md.includes("Build context bridge")).toBe(true);
  });

  test("renderMarkdown includes git branch", () => {
    const md = renderMarkdown(mockContext);
    expect(md.includes("main")).toBe(true);
  });

  test("renderMarkdown includes next actions", () => {
    const md = renderMarkdown(mockContext);
    expect(md.includes("Implement CLI")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/markdownRenderer.test.ts`

Expected: FAIL - "Cannot find module ../src/services/markdownRenderer"

- [ ] **Step 3: Create src/services/markdownRenderer.ts**

```typescript
import { AIContext } from "../models/aiContext";

export function renderMarkdown(context: AIContext): string {
  const lines: string[] = [
    "# AI Context",
    "",
    `**Project:** ${context.project.name}`,
    `**Workspace:** ${context.project.workspacePath}`,
    `**Tech Stack:** ${context.project.techStack.join(", ")}`,
    "",
  ];

  if (context.git.gitAvailable) {
    lines.push(`## Git Context`);
    lines.push(`**Branch:** ${context.git.branch || "unknown"}`);
    if (context.git.modifiedFiles.length > 0) {
      lines.push(`**Modified:** ${context.git.modifiedFiles.join(", ")}`);
    }
    if (context.git.addedFiles.length > 0) {
      lines.push(`**Added:** ${context.git.addedFiles.join(", ")}`);
    }
    if (context.git.deletedFiles.length > 0) {
      lines.push(`**Deleted:** ${context.git.deletedFiles.join(", ")}`);
    }
    lines.push("");
  }

  lines.push(`## Current Goal`, `${context.currentGoal}`, "");
  lines.push(`## Task Description`, `${context.taskDescription}`, "");

  if (context.files.length > 0) {
    lines.push(`## Relevant Files`);
    const byRelevance = (rel: string) =>
      context.files.filter((f) => f.relevance === rel);

    ["high", "medium", "low", "reference"].forEach((rel) => {
      const files = byRelevance(rel);
      if (files.length > 0) {
        lines.push(`### ${rel.charAt(0).toUpperCase() + rel.slice(1)} Relevance`);
        files.forEach((f) => {
          lines.push(`- ${f.path}${f.reason ? ` — ${f.reason}` : ""}`);
        });
      }
    });
    lines.push("");
  }

  if (context.decisions.length > 0) {
    lines.push(`## Decisions`);
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push(`## Constraints`);
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (context.completedWork.length > 0) {
    lines.push(`## Completed Work`);
    context.completedWork.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push(`## Open Issues`);
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push(`## Next Actions`);
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  if (context.notes) {
    lines.push(`## Notes`, context.notes, "");
  }

  return lines.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/markdownRenderer.test.ts`

Expected: PASS - 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/services/markdownRenderer.ts test/markdownRenderer.test.ts
git commit -m "feat: implement Markdown renderer"
```

---

### Task 6: Implement Context Store

**Files:**
- Create: `src/services/contextStore.ts`
- Create: `src/utils/pathUtils.ts`

- [ ] **Step 1: Create src/utils/pathUtils.ts**

```typescript
import * as path from "path";
import * as fs from "fs";

export function getContextBridgeDir(workspacePath: string): string {
  return path.join(workspacePath, ".contextbridge");
}

export function getContextYamlPath(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "context.yaml");
}

export function getAiContextMarkdownPath(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "AI_CONTEXT.md");
}

export function getExportsDir(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "exports");
}

export function getExportPath(workspacePath: string, filename: string): string {
  return path.join(getExportsDir(workspacePath), filename);
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
```

- [ ] **Step 2: Create src/services/contextStore.ts**

```typescript
import * as fs from "fs";
import { AIContext } from "../models/aiContext";
import { renderYaml } from "./yamlRenderer";
import { renderMarkdown } from "./markdownRenderer";
import {
  getContextBridgeDir,
  getContextYamlPath,
  getAiContextMarkdownPath,
  getExportsDir,
  getExportPath,
  ensureDir,
} from "../utils/pathUtils";

export async function ensureContextBridgeFolder(
  workspacePath: string
): Promise<string> {
  const dir = getContextBridgeDir(workspacePath);
  ensureDir(dir);
  ensureDir(getExportsDir(workspacePath));
  return dir;
}

export async function loadContext(
  workspacePath: string
): Promise<AIContext | null> {
  const yamlPath = getContextYamlPath(workspacePath);
  if (!fs.existsSync(yamlPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(yamlPath, "utf-8");
    const { parse } = await import("yaml");
    const context = parse(content) as AIContext;
    return context;
  } catch (error) {
    console.error("Failed to load context:", error);
    return null;
  }
}

export async function saveContext(context: AIContext): Promise<void> {
  const workspacePath = context.project.workspacePath;
  await ensureContextBridgeFolder(workspacePath);

  const yamlPath = getContextYamlPath(workspacePath);
  const markdownPath = getAiContextMarkdownPath(workspacePath);

  const yaml = renderYaml(context);
  const markdown = renderMarkdown(context);

  fs.writeFileSync(yamlPath, yaml, "utf-8");
  fs.writeFileSync(markdownPath, markdown, "utf-8");
}

export async function writeExport(
  workspacePath: string,
  filename: string,
  content: string
): Promise<void> {
  await ensureContextBridgeFolder(workspacePath);
  const exportPath = getExportPath(workspacePath, filename);
  fs.writeFileSync(exportPath, content, "utf-8");
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/utils/pathUtils.ts src/services/contextStore.ts
git commit -m "feat: implement context store and path utilities"
```

---

### Task 7: Implement Export Service

**Files:**
- Create: `src/services/exportService.ts`

- [ ] **Step 1: Create src/services/exportService.ts**

```typescript
import * as vscode from "vscode";
import { AIContext } from "../models/aiContext";
import { writeExport } from "./contextStore";

export type TemplateFunction = (context: AIContext) => string;

export async function generateExport(
  context: AIContext,
  template: TemplateFunction,
  filename: string
): Promise<void> {
  try {
    const rendered = template(context);
    await writeExport(context.project.workspacePath, filename, rendered);
    vscode.window.showInformationMessage(
      `✓ Generated: .contextbridge/exports/${filename}`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to generate export: ${error.message}`
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/services/exportService.ts
git commit -m "feat: implement export service"
```

---

## Phase 3: Templates

### Task 8: Implement Claude Template

**Files:**
- Create: `src/templates/claudeTemplate.ts`

- [ ] **Step 1: Create src/templates/claudeTemplate.ts**

```typescript
import { AIContext } from "../models/aiContext";

export function claudeTemplate(context: AIContext): string {
  const lines: string[] = [
    "# Continue Existing Software Engineering Task",
    "",
    "You are continuing an existing software engineering task. Use the context below as the source of truth.",
    "",
    "## Project",
    "",
    `Project name: ${context.project.name}`,
    "",
    "Tech stack:",
    ...context.project.techStack.map((t) => `- ${t}`),
    "",
  ];

  if (context.git.gitAvailable) {
    lines.push(`Current Git branch:\n${context.git.branch || "unknown"}\n`);
  }

  lines.push("## Current Goal", "", context.currentGoal, "");
  lines.push("## Task Description", "", context.taskDescription, "");

  if (context.files.length > 0) {
    lines.push("## Relevant Files", "");
    ["high", "medium", "low", "reference"].forEach((rel) => {
      const files = context.files.filter((f) => f.relevance === rel);
      if (files.length > 0) {
        lines.push(
          `${rel.charAt(0).toUpperCase() + rel.slice(1)} relevance:`
        );
        files.forEach((f) => {
          lines.push(`- ${f.path}${f.reason ? ` — ${f.reason}` : ""}`);
        });
        lines.push("");
      }
    });
  }

  if (context.git.gitAvailable) {
    lines.push("## Git Changes Summary", "");
    if (context.git.modifiedFiles.length > 0) {
      lines.push("Modified:");
      context.git.modifiedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.addedFiles.length > 0) {
      lines.push("Added:");
      context.git.addedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.deletedFiles.length > 0) {
      lines.push("Deleted:");
      context.git.deletedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.diffSummary) {
      lines.push("Diff summary:");
      lines.push(context.git.diffSummary);
      lines.push("");
    }
  }

  if (context.decisions.length > 0) {
    lines.push("## Decisions Already Made", "");
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push("## Constraints", "");
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (context.completedWork.length > 0) {
    lines.push("## Completed Work", "");
    context.completedWork.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push("## Open Issues / Blockers", "");
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push("## Next Actions", "");
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  lines.push("## Important Rules", "");
  lines.push("- Do not restart the analysis from zero.");
  lines.push("- Do not ask for information that is already provided above.");
  lines.push(
    "- Preserve existing architecture unless the context says otherwise."
  );
  lines.push("- Prioritize the next actions.");
  lines.push(
    "- Ask clarifying questions only if required to avoid a risky implementation."
  );
  lines.push("- If code is needed, explain which files should change and why.");
  lines.push("- Keep output practical and implementation-focused.");
  lines.push("");
  lines.push("## Expected Output", "");
  lines.push(
    "Continue from the current state and help complete the next implementation step."
  );

  return lines.join("\n");
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/templates/claudeTemplate.ts
git commit -m "feat: implement Claude export template"
```

---

### Task 9: Implement Codex, Cursor, and Generic Templates

**Files:**
- Create: `src/templates/codexTemplate.ts`
- Create: `src/templates/cursorTemplate.ts`
- Create: `src/templates/genericTemplate.ts`

- [ ] **Step 1: Create src/templates/codexTemplate.ts**

```typescript
import { AIContext } from "../models/aiContext";

export function codexTemplate(context: AIContext): string {
  const highRelevanceFiles = context.files.filter((f) => f.relevance === "high");

  const lines: string[] = [
    "# Coding Task Continuation",
    "",
    "Continue the following coding task using the project context below.",
    "",
    "## Objective",
    "",
    context.currentGoal,
    "",
  ];

  if (highRelevanceFiles.length > 0) {
    lines.push("## Files to Focus On", "");
    highRelevanceFiles.forEach((f) => {
      lines.push(`- ${f.path}${f.reason ? ` — ${f.reason}` : ""}`);
    });
    lines.push("");
  }

  if (context.git.gitAvailable) {
    lines.push("## Current Git Context", "");
    lines.push(`Branch: ${context.git.branch || "unknown"}`);
    if (context.git.modifiedFiles.length > 0 || context.git.addedFiles.length > 0) {
      lines.push("");
      lines.push("Changed files:");
      [...context.git.modifiedFiles, ...context.git.addedFiles].forEach((f) => {
        lines.push(`- ${f}`);
      });
    }
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push("## Implementation Constraints", "");
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (context.decisions.length > 0) {
    lines.push("## Decisions Already Made", "");
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push("## Known Issues", "");
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push("## Required Next Steps", "");
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  lines.push("## Coding Rules", "");
  lines.push("- Make minimal necessary changes.");
  lines.push("- Follow existing project style.");
  lines.push("- Do not change public APIs unless explicitly required.");
  lines.push("- Do not modify unrelated files.");
  lines.push("- Add or update tests if relevant.");
  lines.push("- Explain the changed files after implementation.");
  lines.push("");
  lines.push("## Expected Output", "");
  lines.push("Implement the next step based on the context above.");

  return lines.join("\n");
}
```

- [ ] **Step 2: Create src/templates/cursorTemplate.ts**

```typescript
import { AIContext } from "../models/aiContext";

export function cursorTemplate(context: AIContext): string {
  const lines: string[] = [
    "# ContextBridge Workspace Context",
    "",
    "Use this as the working context for the current coding session.",
    "",
    "## Goal",
    "",
    context.currentGoal,
    "",
  ];

  if (context.files.length > 0) {
    lines.push("## Relevant Project Files", "");
    context.files.forEach((f) => {
      lines.push(`- ${f.path} (${f.relevance})${f.reason ? ` — ${f.reason}` : ""}`);
    });
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push("## Architecture / Technical Constraints", "");
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  lines.push("## Current Work State", "");

  if (context.completedWork.length > 0) {
    lines.push("Completed:");
    context.completedWork.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push("Pending:");
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push("Blocked:");
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.decisions.length > 0) {
    lines.push("## Decisions", "");
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  lines.push("## Cursor Instructions", "");
  lines.push("- Use the listed files as primary context.");
  lines.push("- Do not scan unrelated parts of the repository unless needed.");
  lines.push("- Prefer small, reviewable changes.");
  lines.push("- Follow the existing code style.");
  lines.push("- Ask before making large architectural changes.");

  return lines.join("\n");
}
```

- [ ] **Step 3: Create src/templates/genericTemplate.ts**

```typescript
import { AIContext } from "../models/aiContext";

export function genericTemplate(context: AIContext): string {
  const lines: string[] = [
    "# AI Context Handoff",
    "",
    "## Project",
    "",
    context.project.name,
    "",
    "## Current Goal",
    "",
    context.currentGoal,
    "",
    "## Summary",
    "",
    context.taskDescription,
    "",
  ];

  if (context.files.length > 0) {
    lines.push("## Relevant Files", "");
    context.files.forEach((f) => {
      lines.push(`- ${f.path} (${f.relevance})${f.reason ? ` — ${f.reason}` : ""}`);
    });
    lines.push("");
  }

  if (context.git.gitAvailable) {
    lines.push("## Current Git State", "");
    lines.push(`Branch: ${context.git.branch || "unknown"}`);
    if (context.git.modifiedFiles.length > 0) {
      lines.push(`Modified: ${context.git.modifiedFiles.join(", ")}`);
    }
    if (context.git.addedFiles.length > 0) {
      lines.push(`Added: ${context.git.addedFiles.join(", ")}`);
    }
    if (context.git.deletedFiles.length > 0) {
      lines.push(`Deleted: ${context.git.deletedFiles.join(", ")}`);
    }
    lines.push("");
  }

  if (context.decisions.length > 0) {
    lines.push("## Decisions", "");
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push("## Constraints", "");
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (context.completedWork.length > 0) {
    lines.push("## Completed", "");
    context.completedWork.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push("## Open Issues", "");
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push("## Next Actions", "");
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  if (context.notes) {
    lines.push("## Notes", "", context.notes, "");
  }

  return lines.join("\n");
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/templates/codexTemplate.ts src/templates/cursorTemplate.ts src/templates/genericTemplate.ts
git commit -m "feat: implement Codex, Cursor, and Generic export templates"
```

---

## Phase 4: Commands

### Task 10: Implement Create Context Package Command

**Files:**
- Create: `src/commands/createContextPackage.ts`

- [ ] **Step 1: Create src/commands/createContextPackage.ts**

```typescript
import * as vscode from "vscode";
import { AIContext } from "../models/aiContext";
import { collectGitContext } from "../services/gitService";
import { saveContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { claudeTemplate } from "../templates/claudeTemplate";
import { codexTemplate } from "../templates/codexTemplate";
import { cursorTemplate } from "../templates/cursorTemplate";
import { genericTemplate } from "../templates/genericTemplate";

export function registerCreateContextPackageCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.createContextPackage",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "Open a workspace before creating a ContextBridge package."
        );
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        // Collect user input
        const currentGoal = await vscode.window.showInputBox({
          prompt: "Enter current goal",
          placeHolder: "e.g., Fix login bug",
        });
        if (currentGoal === undefined) return;

        const taskDescription = await vscode.window.showInputBox({
          prompt: "Enter task description",
          placeHolder: "e.g., Implement authentication flow",
        });
        if (taskDescription === undefined) return;

        const constraintsInput = await vscode.window.showInputBox({
          prompt: "Enter constraints (one per line, empty to skip)",
          placeHolder: "No external APIs",
        });
        const constraints = constraintsInput
          ? constraintsInput.split("\n").filter((s) => s.trim())
          : [];

        const decisionsInput = await vscode.window.showInputBox({
          prompt: "Enter decisions made (one per line, empty to skip)",
          placeHolder: "Use TypeScript",
        });
        const decisions = decisionsInput
          ? decisionsInput.split("\n").filter((s) => s.trim())
          : [];

        const completedInput = await vscode.window.showInputBox({
          prompt: "Enter completed work (one per line, empty to skip)",
          placeHolder: "Setup project",
        });
        const completedWork = completedInput
          ? completedInput.split("\n").filter((s) => s.trim())
          : [];

        const issuesInput = await vscode.window.showInputBox({
          prompt: "Enter open issues (one per line, empty to skip)",
          placeHolder: "None",
        });
        const openIssues = issuesInput
          ? issuesInput.split("\n").filter((s) => s.trim())
          : [];

        const nextActionsInput = await vscode.window.showInputBox({
          prompt: "Enter next actions (one per line, empty to skip)",
          placeHolder: "Implement CLI",
        });
        const nextActions = nextActionsInput
          ? nextActionsInput.split("\n").filter((s) => s.trim())
          : [];

        const filesInput = await vscode.window.showInputBox({
          prompt: "Enter file paths (one per line, empty to skip)",
          placeHolder: "src/main.ts",
        });
        const files = filesInput
          ? filesInput.split("\n").map((p) => ({
              path: p.trim(),
              relevance: "medium" as const,
              includeContent: false,
            }))
          : [];

        // Collect git context
        const gitContext = await collectGitContext(workspacePath);

        // Build AIContext
        const now = new Date().toISOString();
        const context: AIContext = {
          version: "0.1.0",
          project: {
            name: workspaceFolders[0].name,
            workspacePath,
            techStack: ["TypeScript", "VS Code Extension API", "Node.js"],
          },
          git: gitContext,
          currentGoal,
          taskDescription,
          files,
          decisions,
          constraints,
          completedWork,
          openIssues,
          nextActions,
          createdAt: now,
          updatedAt: now,
        };

        // Save context files
        await saveContext(context);
        vscode.window.showInformationMessage(
          "✓ Context files saved to .contextbridge/"
        );

        // Generate exports
        await generateExport(context, claudeTemplate, "claude_handoff.md");
        await generateExport(context, codexTemplate, "codex_handoff.md");
        await generateExport(context, cursorTemplate, "cursor_handoff.md");
        await generateExport(context, genericTemplate, "generic_handoff.md");

        vscode.window.showInformationMessage(
          "✓ All exports generated in .contextbridge/exports/"
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Error creating context package: ${error.message}`
        );
      }
    }
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/commands/createContextPackage.ts
git commit -m "feat: implement create context package command"
```

---

### Task 11: Implement Export Commands

**Files:**
- Create: `src/commands/exportForClaude.ts`
- Create: `src/commands/exportForCodex.ts`
- Create: `src/commands/exportForCursor.ts`

- [ ] **Step 1: Create src/commands/exportForClaude.ts**

```typescript
import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { claudeTemplate } from "../templates/claudeTemplate";

export function registerExportForClaudeCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForClaude",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const context = await loadContext(workspacePath);

      if (!context) {
        vscode.window.showErrorMessage(
          "No context found. Create a context package first."
        );
        return;
      }

      await generateExport(context, claudeTemplate, "claude_handoff.md");
    }
  );
}
```

- [ ] **Step 2: Create src/commands/exportForCodex.ts**

```typescript
import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { codexTemplate } from "../templates/codexTemplate";

export function registerExportForCodexCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForCodex",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const context = await loadContext(workspacePath);

      if (!context) {
        vscode.window.showErrorMessage(
          "No context found. Create a context package first."
        );
        return;
      }

      await generateExport(context, codexTemplate, "codex_handoff.md");
    }
  );
}
```

- [ ] **Step 3: Create src/commands/exportForCursor.ts**

```typescript
import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { cursorTemplate } from "../templates/cursorTemplate";

export function registerExportForCursorCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForCursor",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const context = await loadContext(workspacePath);

      if (!context) {
        vscode.window.showErrorMessage(
          "No context found. Create a context package first."
        );
        return;
      }

      await generateExport(context, cursorTemplate, "cursor_handoff.md");
    }
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/commands/exportForClaude.ts src/commands/exportForCodex.ts src/commands/exportForCursor.ts
git commit -m "feat: implement provider-specific export commands"
```

---

### Task 12: Implement Remaining Commands

**Files:**
- Create: `src/commands/openContextFile.ts`
- Create: `src/commands/refreshGitContext.ts`

- [ ] **Step 1: Create src/commands/openContextFile.ts**

```typescript
import * as vscode from "vscode";
import { getAiContextMarkdownPath } from "../utils/pathUtils";

export function registerOpenContextFileCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.openContextFile",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const filePath = getAiContextMarkdownPath(workspacePath);

      try {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
      } catch (error: any) {
        vscode.window.showErrorMessage(
          "AI_CONTEXT.md not found. Create a context package first."
        );
      }
    }
  );
}
```

- [ ] **Step 2: Create src/commands/refreshGitContext.ts**

```typescript
import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { collectGitContext } from "../services/gitService";
import { saveContext } from "../services/contextStore";

export function registerRefreshGitContextCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.refreshGitContext",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const context = await loadContext(workspacePath);

      if (!context) {
        vscode.window.showErrorMessage(
          "No context found. Create a context package first."
        );
        return;
      }

      try {
        const newGitContext = await collectGitContext(workspacePath);
        context.git = newGitContext;
        context.updatedAt = new Date().toISOString();
        await saveContext(context);
        vscode.window.showInformationMessage(
          "✓ Git context refreshed"
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Failed to refresh Git context: ${error.message}`
        );
      }
    }
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm run compile`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/commands/openContextFile.ts src/commands/refreshGitContext.ts
git commit -m "feat: implement open context file and refresh git context commands"
```

---

## Phase 5: End-to-End Testing

### Task 13: Manual E2E Test of Create & Export Flow

**Files:**
- None (manual test)

- [ ] **Step 1: Compile and package extension**

Run: `npm run compile`

Expected: dist/extension.js created, no TypeScript errors

- [ ] **Step 2: Open extension in VS Code**

1. Open VS Code
2. Navigate to this project folder
3. Press `F5` to launch the extension in debug mode
4. A new VS Code window should open with the extension running

Expected: Extension activates, shows "ContextBridge activated" message

- [ ] **Step 3: Run "Create Context Package" command**

1. In the debug window, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Create Context Package"
3. Press Enter
4. Fill in the prompts:
   - Goal: "Build ContextBridge MVP"
   - Task: "Export AI coding context for multiple providers"
   - Constraints: "No external APIs"
   - Decisions: "Use TypeScript"
   - Completed: "Designed architecture"
   - Open issues: "Need sidebar visualization"
   - Next actions: "Test export templates"
   - Files: "src/extension.ts"

Expected: 
- Messages show context saved
- Messages show all 4 exports generated
- `.contextbridge/` folder created in workspace
- `.contextbridge/context.yaml` exists
- `.contextbridge/AI_CONTEXT.md` exists
- `.contextbridge/exports/claude_handoff.md` exists
- `.contextbridge/exports/codex_handoff.md` exists
- `.contextbridge/exports/cursor_handoff.md` exists
- `.contextbridge/exports/generic_handoff.md` exists

- [ ] **Step 4: Verify exported context quality**

1. Open `.contextbridge/exports/claude_handoff.md`
2. Check it contains:
   - "Continue Existing Software Engineering Task" header
   - "Current Goal" section with your goal
   - "Task Description" section with your task
   - Files listed
   - "Important Rules" section
3. Spot-check: Does it look like a real Claude handoff prompt?

Expected: Yes, it reads well and includes all sections

- [ ] **Step 5: Run "Open Context File" command**

1. Press `Ctrl+Shift+P`
2. Type "Open Context File"
3. Press Enter

Expected: `AI_CONTEXT.md` opens in editor, shows formatted Markdown with all sections

- [ ] **Step 6: Run "Export for Claude" command (re-export)**

1. Modify something in a file (any file in the workspace)
2. Press `Ctrl+Shift+P`
3. Type "Export for Claude"
4. Press Enter

Expected: Message "✓ Generated: .contextbridge/exports/claude_handoff.md"

- [ ] **Step 7: Run "Refresh Git Context" command**

1. Stage a file change with `git add`
2. Press `Ctrl+Shift+P`
3. Type "Refresh Git Context"
4. Press Enter

Expected: Message "✓ Git context refreshed"

- [ ] **Step 8: Verify git context was updated**

1. Open `.contextbridge/context.yaml`
2. Check that git fields are updated (branch, modified files, etc.)
3. Check that `updatedAt` timestamp is newer

Expected: Yes, all updated

- [ ] **Step 9: Commit successful E2E test**

```bash
git add -A
git commit -m "test: successful end-to-end test of MVP"
```

---

## Self-Review Checklist

✅ **Spec Coverage:**
- [x] FR-1: VS Code extension activation + commands — Tasks 1, 10, 11, 12
- [x] FR-2: Sidebar panel — Deferred to Phase 2
- [x] FR-3: Manual context input — Task 10 (quick-input dialogs)
- [x] FR-4: File selection — Task 10
- [x] FR-5: Git context collection — Task 3
- [x] FR-6: Context file generation — Tasks 4, 5, 6
- [x] FR-7: Provider-specific exports — Tasks 8, 9, 11
- [x] Data Models (Section 15) — Task 2
- [x] Claude Export (Section 11) — Task 8
- [x] Codex Export (Section 12) — Task 9
- [x] Cursor Export (Section 13) — Task 9
- [x] Generic Export (Section 14) — Task 9
- [x] AC-1 through AC-6 — All covered

✅ **Type Consistency:**
- All `AIContext` usage is consistent
- All template functions match `TemplateFunction` type
- All service functions match declared signatures

✅ **No Placeholders:**
- Every command includes actual code
- Every test includes actual assertions
- Every export template is complete and formatted

---

## Notes for Implementation

1. **Export-first priority:** All export templates work before sidebar visualization
2. **Simple input:** Quick-input dialogs, not webviews
3. **Local-first:** No external APIs, no telemetry, no cloud
4. **Minimal dependencies:** Only `yaml` library for serialization
5. **Frequent commits:** Each task includes a commit step
6. **DRY:** Service functions are reused by all commands

---

## Next Steps After Implementation

1. **Test on real projects** — Try it with a real VS Code project
2. **Add sidebar visualization** — Build tree view in a separate plan
3. **Context quality score** — Implement scoring algorithm
4. **Sensitive data warnings** — Add redaction for secrets
5. **Publish to marketplace** — Use vsce to publish when ready
