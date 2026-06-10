import * as fs from "fs";
import { AIContext } from "../models/aiContext";
import { renderYaml } from "./yamlRenderer";
import { renderMarkdown } from "./markdownRenderer";
import {
  getContextBridgeDir,
  getContextYamlPath,
  getAiContextMarkdownPath,
  getExportsDir,
  getExportPath,
  ensureDir,
} from "../utils/pathUtils";

export async function ensureContextBridgeFolder(
  workspacePath: string
): Promise<string> {
  const dir = getContextBridgeDir(workspacePath);
  ensureDir(dir);
  ensureDir(getExportsDir(workspacePath));
  return dir;
}

export async function loadContext(
  workspacePath: string
): Promise<AIContext | null> {
  const yamlPath = getContextYamlPath(workspacePath);
  if (!fs.existsSync(yamlPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(yamlPath, "utf-8");
    const { parse } = await import("yaml");
    const context = parse(content) as AIContext;
    return context;
  } catch (error) {
    console.error("Failed to load context:", error);
    return null;
  }
}

export async function saveContext(context: AIContext): Promise<void> {
  const workspacePath = context.project.workspacePath;
  await ensureContextBridgeFolder(workspacePath);

  const yamlPath = getContextYamlPath(workspacePath);
  const markdownPath = getAiContextMarkdownPath(workspacePath);

  const yaml = renderYaml(context);
  const markdown = renderMarkdown(context);

  fs.writeFileSync(yamlPath, yaml, "utf-8");
  fs.writeFileSync(markdownPath, markdown, "utf-8");
}

export async function writeExport(
  workspacePath: string,
  filename: string,
  content: string
): Promise<void> {
  await ensureContextBridgeFolder(workspacePath);
  const exportPath = getExportPath(workspacePath, filename);
  fs.writeFileSync(exportPath, content, "utf-8");
}
