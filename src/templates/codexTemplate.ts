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
