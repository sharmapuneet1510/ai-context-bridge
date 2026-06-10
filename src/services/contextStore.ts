import * as fs from "fs/promises";
import * as fsSync from "fs";
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
  if (!fsSync.existsSync(yamlPath)) {
    return null;
  }

  try {
    const content = await fs.readFile(yamlPath, "utf-8");
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

  try {
    await fs.writeFile(yamlPath, yaml, "utf-8");
    await fs.writeFile(markdownPath, markdown, "utf-8");
  } catch (error) {
    console.error("Failed to save context:", error);
    throw error;
  }
}

export async function writeExport(
  workspacePath: string,
  filename: string,
  content: string
): Promise<void> {
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new Error("Invalid filename: path traversal not allowed");
  }

  await ensureContextBridgeFolder(workspacePath);
  const exportPath = getExportPath(workspacePath, filename);

  try {
    await fs.writeFile(exportPath, content, "utf-8");
  } catch (error) {
    console.error("Failed to write export:", error);
    throw error;
  }
}
