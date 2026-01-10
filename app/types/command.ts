import { ChildProcess, spawn } from "child_process";
import path from "path";
import { pathLocateExec } from "../utils/pathLocate";
import { readFileSync } from "fs";
import { commandNotFound, typeNotFound } from "../utils/notFound";
import { validTypeCommands } from "../types/validBuiltin";
import { spawnCommand } from "../executor/spawnCommand";
import { addHistory, getAllHistory } from "../utils/history";
import { isNumberObject } from "util/types";

export function handleCustomCommand(
  command: string[],
  loop: () => void,
  outFd: number | null,
  errFd: number | null
): void {
  const proc = spawnCommand(command, [
    "inherit",
    outFd ?? "inherit",
    errFd ?? "inherit"
  ]);

  if (!proc) {
    commandNotFound(command[0]);
    return loop();
  }

  proc.on("exit", loop);
  proc.on("error", loop);
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

// handle history command
export function handleHistoryCommand(args: string[], write: (msg: string) => void): void {
  if (args[0] === "-r") {
    for (let i = 1; i < args.length; i++) {
      const file = readFileSync(args[i], "utf-8");
      const lines = file.split("\n");

      for (const line of lines) {
        if (line.trim() !== "") {
          addHistory(line);
        }
      }
    }
    return;
  }

  const histories = getAllHistory();

  for (let i = 0; i < histories.length; i++) {
    write(`    ${i + 1}  ${histories[i]}\n`);
  }
}