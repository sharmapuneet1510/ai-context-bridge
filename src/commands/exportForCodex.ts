import * as vscode from "vscode";

export function registerExportForCodexCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForCodex",
    async () => {
      vscode.window.showInformationMessage("Export for Codex command");
    }
  );
}
