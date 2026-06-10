import * as vscode from "vscode";
import { registerCreateContextPackageCommand } from "./commands/createContextPackage";
import { registerExportForClaudeCommand } from "./commands/exportForClaude";
import { registerExportForCodexCommand } from "./commands/exportForCodex";
import { registerExportForCursorCommand } from "./commands/exportForCursor";
import { registerOpenContextFileCommand } from "./commands/openContextFile";
import { registerRefreshGitContextCommand } from "./commands/refreshGitContext";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCreateContextPackageCommand());
  context.subscriptions.push(registerExportForClaudeCommand());
  context.subscriptions.push(registerExportForCodexCommand());
  context.subscriptions.push(registerExportForCursorCommand());
  context.subscriptions.push(registerOpenContextFileCommand());
  context.subscriptions.push(registerRefreshGitContextCommand());

  vscode.window.showInformationMessage("ContextBridge activated");
}

export function deactivate() {}
