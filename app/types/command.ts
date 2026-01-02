import { spawn } from "child_process";
import path from "path";
import { pathLocateExec } from "../utils/pathLocate";
import { readFileSync } from "fs";
import { Writable } from "stream";
import { commandNotFound, typeNotFound } from "../utils/notFound";
import { validTypeCommands } from "../types/validBuiltin";

export function handleCustomCommand(
  command: string[],
  loop: () => void,
  out: Writable | null
): void {
  const result = pathLocateExec(command);

  if (!result) {
    commandNotFound(command[0]);
    loop();
    return;
  }

  const filename = path.basename(result);
  const args = command.slice(1);

  const proc = spawn(filename, args, {
    stdio: [
      "inherit",
      out ?? "inherit", // stdout
      "inherit"         // stderr
    ]
  });

  proc.on("exit", () => loop());
  proc.on("error", () => loop());
}

export function handleWorkingDirectory(args: string[]): void {
  console.log(process.cwd());
}

export function handleChangeDirectory(args: string[]): void {
  const dir = args[0] || process.env.HOME || "";
  try {
    if (dir === "~") process.chdir(process.env.HOME || "");
    else process.chdir(dir);
  } catch {
    console.error(`cd: ${dir}: No such file or directory`);
  }
}

export function handleCatCommand(
  args: string[],
  write: (msg: string) => void
): void {
  for (const file of args) {
    try {
      write(readFileSync(file, "utf-8"));
    } catch {
      console.error(`cat: ${file}: No such file or directory`);
    }
  }
}

export function handleTypeCommand(
  args: string[],
  write: (msg: string) => void
): void {
  const cmd = args[0];

  if (validTypeCommands.includes(cmd)) {
    write(`${cmd} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec([cmd]);
  if (result) write(`${cmd} is ${result}\n`);
  else typeNotFound(cmd);
}
