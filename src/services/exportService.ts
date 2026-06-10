import * as vscode from "vscode";
import { AIContext } from "../models/aiContext";
import { writeExport } from "./contextStore";

export type TemplateFunction = (context: AIContext) => string;

export async function generateExport(
  context: AIContext,
  template: TemplateFunction,
  filename: string
): Promise<void> {
  try {
    const rendered = template(context);
    await writeExport(context.project.workspacePath, filename, rendered);
    vscode.window.showInformationMessage(
      `✓ Generated: .contextbridge/exports/${filename}`
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to generate export: ${error.message}`
    );
  }
}
