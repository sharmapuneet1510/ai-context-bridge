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
