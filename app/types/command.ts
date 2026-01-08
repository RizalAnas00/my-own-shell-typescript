import { ChildProcess, spawn } from "child_process";
import path from "path";
import { pathLocateExec } from "../utils/pathLocate";
import { readFileSync } from "fs";
import { commandNotFound, typeNotFound } from "../utils/notFound";
import { validTypeCommands } from "../types/validBuiltin";

export function handleCustomCommand(
  command: string[],
  loop: () => void,
  outFd: number | null,
  errFd: number | null
): void {
  const result: string | null = pathLocateExec(command);

  if (!result) {
    commandNotFound(command[0]);
    loop();
    return;
  }

  const filename: string = path.basename(result);
  const args: string[] = command.slice(1);

  const proc: ChildProcess = spawn(filename, args, {
    stdio: [
      "inherit",
      outFd !== null ? outFd : "inherit",
      errFd !== null ? errFd : "inherit"
    ]
  });

  proc.on("exit", () => loop());
  proc.on("error", () => loop());
}

export function handleChangeDirectory(
  args: string[],
  writeErr: (msg: string) => void
): void {
  const dir: string = args[0] || process.env.HOME || "";
  try {
    if (dir === "~") process.chdir(process.env.HOME || "");
    else process.chdir(dir);
  } catch {
    writeErr(`cd: ${dir}: No such file or directory\n`);
  }
}

export function handleCatCommand(
  args: string[],
  writeOut: (msg: string) => void,
  writeErr: (msg: string) => void
): void {
  for (const file of args) {
    try {
      writeOut(readFileSync(file, "utf-8"));
    } catch {
      writeErr(`cat: ${file}: No such file or directory\n`);
    }
  }
}

export function handleTypeCommand(
  args: string[],
  write: (msg: string) => void
): void {
  const cmd: string = args[0];

  if (validTypeCommands.includes(cmd)) {
    write(`${cmd} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec([cmd]);
  if (result) write(`${cmd} is ${result}\n`);
  else typeNotFound(cmd);
}
