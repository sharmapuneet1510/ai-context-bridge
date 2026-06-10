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
