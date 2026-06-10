import { stringify } from "yaml";
import { AIContext } from "../models/aiContext";

export function renderYaml(context: AIContext): string {
  const yamlObj = {
    version: context.version,
    project: {
      name: context.project.name,
      workspacePath: context.project.workspacePath,
      techStack: context.project.techStack,
    },
    git: {
      branch: context.git.branch,
      gitAvailable: context.git.gitAvailable,
      modifiedFiles: context.git.modifiedFiles,
      addedFiles: context.git.addedFiles,
      deletedFiles: context.git.deletedFiles,
      renamedFiles: context.git.renamedFiles,
      diffSummary: context.git.diffSummary,
    },
    currentGoal: context.currentGoal,
    taskDescription: context.taskDescription,
    files: context.files,
    decisions: context.decisions,
    constraints: context.constraints,
    completedWork: context.completedWork,
    openIssues: context.openIssues,
    nextActions: context.nextActions,
    notes: context.notes,
    createdAt: context.createdAt,
    updatedAt: context.updatedAt,
  };

  return stringify(yamlObj);
}
