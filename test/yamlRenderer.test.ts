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
