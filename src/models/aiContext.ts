export type RelevanceLevel = "high" | "medium" | "low" | "reference";

export interface ContextFile {
  path: string;
  relevance: RelevanceLevel;
  reason?: string;
  includeContent: boolean;
  contentSnippet?: string;
}

export interface GitContext {
  branch?: string;
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  renamedFiles: string[];
  diffSummary?: string;
  gitAvailable: boolean;
}

export interface AIContext {
  version: string;

  project: {
    name: string;
    workspacePath: string;
    techStack: string[];
  };

  git: GitContext;

  currentGoal: string;
  taskDescription: string;

  files: ContextFile[];

  decisions: string[];
  constraints: string[];
  completedWork: string[];
  openIssues: string[];
  nextActions: string[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ContextQualityResult {
  score: number;
  missing: string[];
}
