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
