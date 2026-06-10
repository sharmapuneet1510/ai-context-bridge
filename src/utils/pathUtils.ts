import * as path from "path";
import * as fs from "fs";

export function getContextBridgeDir(workspacePath: string): string {
  return path.join(workspacePath, ".contextbridge");
}

export function getContextYamlPath(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "context.yaml");
}

export function getAiContextMarkdownPath(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "AI_CONTEXT.md");
}

export function getExportsDir(workspacePath: string): string {
  return path.join(getContextBridgeDir(workspacePath), "exports");
}

export function getExportPath(workspacePath: string, filename: string): string {
  return path.join(getExportsDir(workspacePath), filename);
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
