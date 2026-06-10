import { AIContext } from "../models/aiContext";

export function claudeTemplate(context: AIContext): string {
  const lines: string[] = [
    "# Continue Existing Software Engineering Task",
    "",
    "You are continuing an existing software engineering task. Use the context below as the source of truth.",
    "",
    "## Project",
    "",
    `Project name: ${context.project.name}`,
    "",
    "Tech stack:",
    ...context.project.techStack.map((t) => `- ${t}`),
    "",
  ];

  if (context.git.gitAvailable) {
    lines.push(`Current Git branch:\n${context.git.branch || "unknown"}\n`);
  }

  lines.push("## Current Goal", "", context.currentGoal, "");
  lines.push("## Task Description", "", context.taskDescription, "");

  if (context.files.length > 0) {
    lines.push("## Relevant Files", "");
    ["high", "medium", "low", "reference"].forEach((rel) => {
      const files = context.files.filter((f) => f.relevance === rel);
      if (files.length > 0) {
        lines.push(
          `${rel.charAt(0).toUpperCase() + rel.slice(1)} relevance:`
        );
        files.forEach((f) => {
          lines.push(`- ${f.path}${f.reason ? ` — ${f.reason}` : ""}`);
        });
        lines.push("");
      }
    });
  }

  if (context.git.gitAvailable) {
    lines.push("## Git Changes Summary", "");
    if (context.git.modifiedFiles.length > 0) {
      lines.push("Modified:");
      context.git.modifiedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.addedFiles.length > 0) {
      lines.push("Added:");
      context.git.addedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.deletedFiles.length > 0) {
      lines.push("Deleted:");
      context.git.deletedFiles.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (context.git.diffSummary) {
      lines.push("Diff summary:");
      lines.push(context.git.diffSummary);
      lines.push("");
    }
  }

  if (context.decisions.length > 0) {
    lines.push("## Decisions Already Made", "");
    context.decisions.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (context.constraints.length > 0) {
    lines.push("## Constraints", "");
    context.constraints.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (context.completedWork.length > 0) {
    lines.push("## Completed Work", "");
    context.completedWork.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (context.openIssues.length > 0) {
    lines.push("## Open Issues / Blockers", "");
    context.openIssues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  if (context.nextActions.length > 0) {
    lines.push("## Next Actions", "");
    context.nextActions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  lines.push("## Important Rules", "");
  lines.push("- Do not restart the analysis from zero.");
  lines.push("- Do not ask for information that is already provided above.");
  lines.push(
    "- Preserve existing architecture unless the context says otherwise."
  );
  lines.push("- Prioritize the next actions.");
  lines.push(
    "- Ask clarifying questions only if required to avoid a risky implementation."
  );
  lines.push("- If code is needed, explain which files should change and why.");
  lines.push("- Keep output practical and implementation-focused.");
  lines.push("");
  lines.push("## Expected Output", "");
  lines.push(
    "Continue from the current state and help complete the next implementation step."
  );

  return lines.join("\n");
}
