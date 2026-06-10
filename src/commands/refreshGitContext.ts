import * as vscode from "vscode";

export function registerRefreshGitContextCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.refreshGitContext",
    async () => {
      vscode.window.showInformationMessage("Refresh Git Context command");
    }
  );
}
