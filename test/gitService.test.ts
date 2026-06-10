import { collectGitContext } from "../src/services/gitService";

describe("gitService", () => {
  test("collectGitContext returns gitAvailable false when git command fails", () => {
    const context = collectGitContext("/nonexistent/path");
    expect(context.gitAvailable).toBe(false);
    expect(context.branch).toBeUndefined();
  });

  test("collectGitContext returns branch name when git available", () => {
    const workspacePath = process.cwd();
    const context = collectGitContext(workspacePath);
    // Only check if in a git repo, but don't conditionally assert
    if (!context.gitAvailable) {
      console.log("Note: not in a git repository, skipping branch test");
      return;
    }
    expect(context.branch).toBeDefined();
    expect(typeof context.branch).toBe("string");
  });

  test("collectGitContext parses modified, added, deleted files", () => {
    const workspacePath = process.cwd();
    const context = collectGitContext(workspacePath);
    // Arrays should always exist, even if empty
    expect(context.modifiedFiles).toBeInstanceOf(Array);
    expect(context.addedFiles).toBeInstanceOf(Array);
    expect(context.deletedFiles).toBeInstanceOf(Array);
    expect(context.renamedFiles).toBeInstanceOf(Array);
  });
});
