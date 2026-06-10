import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { collectGitContext } from "../services/gitService";
import { saveContext } from "../services/contextStore";

export function registerRefreshGitContextCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.refreshGitContext",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const context = await loadContext(workspacePath);

      if (!context) {
        vscode.window.showErrorMessage(
          "No context found. Create a context package first."
        );
        return;
      }

      try {
        const newGitContext = await collectGitContext(workspacePath);
        context.git = newGitContext;
        context.updatedAt = new Date().toISOString();
        await saveContext(context);
        vscode.window.showInformationMessage(
          "✓ Git context refreshed"
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Failed to refresh Git context: ${error.message}`
        );
      }
    }
  );
}
