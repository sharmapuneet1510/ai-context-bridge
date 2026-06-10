import * as vscode from "vscode";

export function registerOpenContextFileCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.openContextFile",
    async () => {
      vscode.window.showInformationMessage("Open Context File command");
    }
  );
}
