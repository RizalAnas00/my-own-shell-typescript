import path from "path";
import { accessSync, constants } from "fs";
import { createInterface } from "readline";
import { spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
});

const validTypeCommands: string[] = ["echo", "type", "exit"];

// ----------------- ERROR HANDLING ---------------- //

function commandNotFound(command: string): void {
  process.stdout.write(`${command}: command not found\n`);
}

function typeNotFound(command: string): void {
  process.stdout.write(`${command}: not found\n`);
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

function handleTypeCommand(command: string[]): void {
  if (validTypeCommands.includes(command[0])) {
    process.stdout.write(`${command[0]} is a shell builtin\n`);
    return;
  }

  const result = pathLocateExec(command);
  if (result) {
    process.stdout.write(`${command[0]} is ${result}\n`);
  } else {
    typeNotFound(command[0]);
  }
}

function handleCommand(command: string, args: string[]): void {
  switch (command) {
    case "echo":
      process.stdout.write(args.join(" ") + "\n");
      loop();
      break;
    case "type":
      if (args.length === 0) {
        process.stdout.write("type: missing operand\n");
      } else {
        handleTypeCommand(args);
      }
      loop();
      break;
    default:
      handleCustomCommand([command, ...args]);
  }
}

function loop(): void {
  process.stdout.write("$ ");

  rl.question("", (answer) => {
    const input = answer.trim();
    
    if (!input) {
      loop();
      return;
    }

    const parts = input.split(" ");
    const [command, ...args] = parts;

    if (command === 'exit') {
      rl.close();
      return;
    } else {
      handleCommand(command, args);
    }
  });
}

function main() {
  loop();
}

main();