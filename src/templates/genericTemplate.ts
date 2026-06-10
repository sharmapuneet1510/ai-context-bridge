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
