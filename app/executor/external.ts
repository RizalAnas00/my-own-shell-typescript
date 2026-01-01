import { spawn } from "child_process";
import { pathLocateExec } from "../utils/pathLocate";
import { print } from "../utils/print";

export function executeExternal(tokens: string[], onExit: () => void) {
  const command = tokens[0];
  const args = tokens.slice(1);

  const fullPath = pathLocateExec(tokens);
  if (!fullPath) {
    print(`${command}: command not found\n`);
    onExit();
    return;
  }

  const proc = spawn(fullPath, args, { stdio: "inherit" });

  proc.on("exit", onExit);
  proc.on("error", onExit);
}
