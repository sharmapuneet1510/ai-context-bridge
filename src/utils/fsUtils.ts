import { execSync } from "child_process";

export function executeCommand(
  command: string,
  cwd: string
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(command, { cwd, encoding: "utf-8" }).trim();
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    const stderr = error.stderr?.toString?.() || error.message || "Command failed";
    return {
      stdout: "",
      stderr,
      exitCode: error.status || 1,
    };
  }
}
