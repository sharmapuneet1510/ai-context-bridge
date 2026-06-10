import * as vscode from "vscode";
import { loadContext } from "../services/contextStore";
import { generateExport } from "../services/exportService";
import { cursorTemplate } from "../templates/cursorTemplate";

export function registerExportForCursorCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForCursor",
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

      await generateExport(context, cursorTemplate, "cursor_handoff.md");
    }
  );
}
