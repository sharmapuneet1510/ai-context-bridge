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
