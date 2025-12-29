import path from "path";
import { accessSync, constants } from "fs";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const validTypeCommands: string[] = ["echo", "type", "exit"];

function pathLocateExec(command: string): string | null {
  // Real look up of executable in PATH Env in this PC
  const paths = process.env.PATH?.split(path.delimiter) || [];

  for (const p of paths) {
    const fullPath = path.join(p, command);
    try {
      accessSync(fullPath, constants.X_OK);
      return `${command} is ${fullPath}\n`;
    } catch {
      // ignore
    }
  }

  return null;
}

function commandNotFound(command: string): void {
  rl.write(`${command}: command not found\n`);
}

function typeNotFound(command: string): void {
  rl.write(`${command}: not found\n`);
}

function handleTypeCommand(command: string): void {
  if (validTypeCommands.includes(command)) {
    rl.write(`${command} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec(command);
  if (result) {
    rl.write(result);
  } else {
    typeNotFound(command);
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
          handleTypeCommand(args[0]);
        }
        break;
    default:
        commandNotFound(command);
  }
}

function loop(): void {
  rl.question("$ ", (answer) => {
    const input = answer.trim();
    const parts = input.split(" ");

    if (parts.length > 0) {
      const [command, ...args] = parts;
      
      if (command === 'exit') {
        rl.close();
        return;
      } else {
        handleCommand(command, args);
      }
    }

    loop();
  });
}

function main() {
  loop();
}

main();