import * as vscode from "vscode";

export function registerExportForCursorCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForCursor",
    async () => {
      vscode.window.showInformationMessage("Export for Cursor command");
    }
  );
}
