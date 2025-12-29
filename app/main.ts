import path from "path";
import { accessSync, constants } from "fs";
import { createInterface } from "readline";
import { spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
  if (result) {
    const fileName = path.basename(result);
    const args = [command[1], ...command.slice(2)];

    const proc = spawn(fileName, args, { stdio: 'inherit' });

    proc.on('error', (err) => {
      rl.write(`Error executing ${fileName}: ${err.message}\n`);
    });

    proc.on('exit', (code) => {
      if (code !== 0) {
        rl.write(`${fileName} exited with code ${code}\n`);
      }
    })   
  } else {
    commandNotFound(command[0]);
  }
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