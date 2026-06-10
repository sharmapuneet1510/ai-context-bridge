import * as vscode from "vscode";

export function registerCreateContextPackageCommand(): vscode.Disposable {
  return vscode.commands.registerCommand(
    "contextbridge.createContextPackage",
    async () => {
      vscode.window.showInformationMessage("Create Context Package command");
    }
  );
}
