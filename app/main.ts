import path from "path";
import { accessSync, constants } from "fs";
import { createInterface } from "readline";
import { spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("$ ");

const validTypeCommands: string[] = ["echo", "type", "exit"];

// ----------------- ERROR HANDLING ---------------- //

function commandNotFound(command: string): void {
  rl.write(`${command}: command not found\n`);
}

function typeNotFound(command: string): void {
  rl.write(`${command}: not found\n`);
}

// ----------------- ERROR HANDLING END ---------------- //

function pathLocateExec(command: string[]): string | null {
  // Real look up of executable in PATH Env in this PC
  const paths = process.env.PATH?.split(path.delimiter) || [];

  for (const p of paths) {
    const fullPath = path.join(p, command[0]);
    try {
      accessSync(fullPath, constants.X_OK);
      // return `${command} is ${fullPath}\n`;
      return fullPath;
    } catch {
      // ignore
    }
  }

  return null;
}

function handleCustomCommand(command: string[]): void {
  const result = pathLocateExec(command);

  if (!result) {
    commandNotFound(command[0]);
    rl.prompt();
    return;
  }

  rl.pause();

  const fileName = result;
  const args = command.slice(1);

  const proc = spawn(fileName, args, { stdio: "inherit" });

  proc.on("close", () => {
    rl.resume();
    rl.prompt();
  });

  proc.on("error", (err) => {
    rl.write(`Error executing ${fileName}: ${err.message}\n`);
    rl.resume();
    rl.prompt();
  });
}

function handleTypeCommand(command: string[]): void {
  if (validTypeCommands.includes(command[0])) {
    rl.write(`${command[0]} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec(command);
  if (result) {
    rl.write(`${command[0]} is ${result}\n`);
  } else {
    typeNotFound(command[0]);
  }
}

function handleCommand(command: string, args: string[]): void {
  switch (command) {
    case "echo":
        rl.write(args.join(" ") + "\n");
        break;
    case "type":
        if (args.length === 0) {
          rl.write("type: missing operand\n");
        } else {
          handleTypeCommand(args);
        }
        break;
    default:
        handleCustomCommand([command, ...args]);
  }
}

function loop(): void {
  // rl.prompt();

  rl.once("line", (answer) => {
    const input = answer.trim();
    const parts = input.split(" ");

    if (parts.length > 0) {
      const [command, ...args] = parts;

      if (command === "exit") {
        rl.close();
        return;
      }

      handleCommand(command, args);
    }

    loop();
  });
}

function main() {
  loop();
}

main();