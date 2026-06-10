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
