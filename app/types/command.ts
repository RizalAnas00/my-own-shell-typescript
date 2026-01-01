import { spawn } from "child_process";
import path from "path";
import { pathLocateExec } from "../utils/pathLocate";
import { print } from "../utils/print";
import { readFileSync } from "fs";
import { commandNotFound, typeNotFound } from "../utils/notFound";
import { validTypeCommands } from "../types/validBuiltin";

export function handleCustomCommand(command: string[], loop: () => void): void {
  const result = pathLocateExec(command);
  if (result) {
    const filename = path.basename(result);
    const args = command.slice(1);
    const proc = spawn(filename, args, { stdio: 'inherit' });

    proc.on('exit', () => {
      loop(); 
    });

    proc.on('error', (err) => {
      loop();
    });
  } else {
    // if command not found and not a builtin
    commandNotFound(command[0]);
    loop();
  }
}

export function handleTypeCommand(command: string[]): void {
  if (validTypeCommands.includes(command[0])) {
    print(`${command[0]} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec(command);
  if (result) {
    print(`${command[0]} is ${result}\n`);
  } else {
    typeNotFound(command[0]);
  }
}

export function handleWorkingDirectory(args: string[]): void {
  if(args[0] == "~") {
    print(process.env.HOME + "\n");
    return;
  }

  print(process.cwd() + "\n");
}

export function handleChangeDirectory(args: string[]): void {
  const dir = args[0] || process.env.HOME || "";
  try {
    if (dir === "~") {
      process.chdir(process.env.HOME || "");
      return;
    }
    process.chdir(dir);
  } catch (err) {
    print(`cd: ${dir}: No such file or directory\n`);
  }
}

export function handleEchoCommand(args: string[]): void {
  print(args.join(" ") + "\n");
}

export function handleCatCommand(args: string[]): void {
  try {
    for (const filePath of args) {
      const data = readFileSync(filePath, 'utf-8');
      print(data);
    }
  } catch (err) {
    print(`No such file or directory\n`);
  }
}