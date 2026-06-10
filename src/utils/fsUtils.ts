import { execSync } from "child_process";

export function executeCommand(
  command: string,
  cwd: string
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(command, { cwd, encoding: "utf-8" }).trim();
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: "",
      stderr: error.message || "Command failed",
      exitCode: error.status || 1,
    };
  }
}
