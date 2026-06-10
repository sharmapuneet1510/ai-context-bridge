import * as vscode from "vscode";
import { AIContext } from "../models/aiContext";
import { collectGitContext } from "../services/gitService";
import { saveContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { claudeTemplate } from "../templates/claudeTemplate";
import { codexTemplate } from "../templates/codexTemplate";
import { cursorTemplate } from "../templates/cursorTemplate";
import { genericTemplate } from "../templates/genericTemplate";

export function registerCreateContextPackageCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.createContextPackage",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "Open a workspace before creating a ContextBridge package."
        );
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;

      try {
        // Collect user input
        const currentGoal = await vscode.window.showInputBox({
          prompt: "Enter current goal",
          placeHolder: "e.g., Fix login bug",
        });
        if (currentGoal === undefined) return;

        const taskDescription = await vscode.window.showInputBox({
          prompt: "Enter task description",
          placeHolder: "e.g., Implement authentication flow",
        });
        if (taskDescription === undefined) return;

        const constraintsInput = await vscode.window.showInputBox({
          prompt: "Enter constraints (one per line, empty to skip)",
          placeHolder: "No external APIs",
        });
        const constraints = constraintsInput
          ? constraintsInput.split("\n").filter((s) => s.trim())
          : [];

        const decisionsInput = await vscode.window.showInputBox({
          prompt: "Enter decisions made (one per line, empty to skip)",
          placeHolder: "Use TypeScript",
        });
        const decisions = decisionsInput
          ? decisionsInput.split("\n").filter((s) => s.trim())
          : [];

        const completedInput = await vscode.window.showInputBox({
          prompt: "Enter completed work (one per line, empty to skip)",
          placeHolder: "Setup project",
        });
        const completedWork = completedInput
          ? completedInput.split("\n").filter((s) => s.trim())
          : [];

        const issuesInput = await vscode.window.showInputBox({
          prompt: "Enter open issues (one per line, empty to skip)",
          placeHolder: "None",
        });
        const openIssues = issuesInput
          ? issuesInput.split("\n").filter((s) => s.trim())
          : [];

        const nextActionsInput = await vscode.window.showInputBox({
          prompt: "Enter next actions (one per line, empty to skip)",
          placeHolder: "Implement CLI",
        });
        const nextActions = nextActionsInput
          ? nextActionsInput.split("\n").filter((s) => s.trim())
          : [];

        const filesInput = await vscode.window.showInputBox({
          prompt: "Enter file paths (one per line, empty to skip)",
          placeHolder: "src/main.ts",
        });
        const files = filesInput
          ? filesInput.split("\n").map((p) => ({
              path: p.trim(),
              relevance: "medium" as const,
              includeContent: false,
            }))
          : [];

        // Collect git context
        const gitContext = collectGitContext(workspacePath);

        // Build AIContext
        const now = new Date().toISOString();
        const context: AIContext = {
          version: "0.1.0",
          project: {
            name: workspaceFolders[0].name,
            workspacePath,
            techStack: ["TypeScript", "VS Code Extension API", "Node.js"],
          },
          git: gitContext,
          currentGoal,
          taskDescription,
          files,
          decisions,
          constraints,
          completedWork,
          openIssues,
          nextActions,
          createdAt: now,
          updatedAt: now,
        };

        // Save context files
        await saveContext(context);
        vscode.window.showInformationMessage(
          "✓ Context files saved to .contextbridge/"
        );

        // Generate exports
        await generateExport(context, claudeTemplate, "claude_handoff.md");
        await generateExport(context, codexTemplate, "codex_handoff.md");
        await generateExport(context, cursorTemplate, "cursor_handoff.md");
        await generateExport(context, genericTemplate, "generic_handoff.md");

        vscode.window.showInformationMessage(
          "✓ All exports generated in .contextbridge/exports/"
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Error creating context package: ${error.message}`
        );
      }
    }
  );
}
