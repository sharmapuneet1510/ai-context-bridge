import { GitContext } from "../models/aiContext";
import { executeCommand } from "../utils/fsUtils";

export function collectGitContext(workspacePath: string): GitContext {
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
      if (line.length < 2) return; // Safety check
      const status = line.substring(0, 2);
      const file = line.substring(3);
      if (status[0] === "M" || status[1] === "M") context.modifiedFiles.push(file);
      if (status[0] === "A" || status[1] === "A") context.addedFiles.push(file);
      if (status[0] === "D" || status[1] === "D") context.deletedFiles.push(file);
      if (status[0] === "R") {
        // Git format: "oldname -> newname"
        const parts = file.split(" -> ");
        const newName = parts[1]?.trim() || file;
        context.renamedFiles.push(newName);
      }
    });
  }

  // Get diff summary
  const diffResult = executeCommand("git diff --stat", workspacePath);
  if (diffResult.exitCode === 0) {
    context.diffSummary = diffResult.stdout;
  }

  return context;
}
