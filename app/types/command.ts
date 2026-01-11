import { ChildProcess, spawn } from "child_process";
import path from "path";
import { pathLocateExec } from "../utils/pathLocate";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { commandNotFound, typeNotFound } from "../utils/notFound";
import { validTypeCommands } from "../types/validBuiltin";
import { spawnCommand } from "../executor/spawnCommand";
import { addHistory, getAllHistory } from "../utils/history";
import { isNumberObject } from "util/types";

let lastHistoryWriteIndex = 0;

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
export function handleHistoryCommand(
  args: string[],
  write: (msg: string) => void
): void {
  const opt = args[0];

  switch (opt) {
    case "-r": {
      const cmd = args.length === 0
        ? "history"
        : `history ${args.join(" ")}`;

      addHistory(cmd);


      const files = args.slice(1);
      for (const f of files) {
        const content = readFileSync(f, "utf-8");

        for (const line of content.split("\n")) {
          if (line.trim() !== "") {
            addHistory(line);
          }
        }
      }
      return;
    }

    case "-w": {
      const cmd = args.length === 0
        ? "history"
        : `history ${args.join(" ")}`;

      addHistory(cmd);


      const histories = getAllHistory();
      writeFileSync(args[1], histories.join("\n") + "\n");
      lastHistoryWriteIndex = histories.length;
      return;
    }

    case "-a": {
        const cmd = args.length === 0
          ? "history"
          : `history ${args.join(" ")}`;

        addHistory(cmd);

        appendHistory(args);

        return;
    }

    default: {
        const cmd = args.length === 0
          ? "history"
          : `history ${args.join(" ")}`;

        addHistory(cmd);


        const histories = getAllHistory();
        const limit = opt ? Number(opt) : histories.length;
        const start = Math.max(0, histories.length - limit);

        for (let i = start; i < histories.length; i++) {
            write(`    ${i + 1}  ${histories[i]}\n`);
        }
    }

  }
}

export function appendHistory(args: string[]) {
  const histories = getAllHistory();
  const newEntries = histories.slice(lastHistoryWriteIndex);
  if (newEntries.length === 0) return;

  const hispath =
    args[1] ??
    process.env.HISTFILE ??
    path.join(process.env.HOME || "", ".bash_history");

  appendFileSync(hispath, newEntries.join("\n") + "\n");
  lastHistoryWriteIndex = histories.length;
}

