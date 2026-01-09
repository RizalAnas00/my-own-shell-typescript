// executor/spawnCommand.ts
import { spawn, ChildProcess } from "child_process";
import { pathLocateExec } from "../utils/pathLocate";

export function spawnCommand(
  command: string[],
  stdio: any
): ChildProcess | null {
  const fullPath = pathLocateExec(command);
  if (!fullPath) return null;

  return spawn(fullPath, command.slice(1), { stdio });
}
