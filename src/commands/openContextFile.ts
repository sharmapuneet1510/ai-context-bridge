import * as vscode from "vscode";
import { getAiContextMarkdownPath } from "../utils/pathUtils";

export function registerOpenContextFileCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.openContextFile",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Open a workspace first.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const filePath = getAiContextMarkdownPath(workspacePath);

      try {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
      } catch (error: any) {
        vscode.window.showErrorMessage(
          "AI_CONTEXT.md not found. Create a context package first."
        );
      }
    }
  );
}
