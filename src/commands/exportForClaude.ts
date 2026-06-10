import * as vscode from "vscode";

export function registerExportForClaudeCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.exportForClaude",
    async () => {
      vscode.window.showInformationMessage("Export for Claude command");
    }
  );
}
