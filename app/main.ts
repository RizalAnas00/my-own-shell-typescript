import path from "path";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const validTypeCommands: string[] = ["echo", "type", "exit"];

function pathLocateExec(command: string): string | null {
  // Real look up of executable in PATH Env in this PC
  const paths = (process.env.PATH?.split(path.delimiter) || "");
  for (const p of paths) {
    const fullPath = path.join(p, command);
    try {
      if (require("fs").existsSync(fullPath)) {
        return fullPath;
      }    } catch (err) {
      // Ignore errors
    }
  }

  return commandNotFound(command), null;
}

function commandNotFound(command: string): void {
  rl.write(`${command}: command not found\n`);
}

function handleTypeCommand(command: string): void {
  if (!validTypeCommands.includes(command)) {
    pathLocateExec(command);
  } else {
    rl.write(`${command} is a shell builtin\n`);
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
        rl.write(`${command}: command not found\n`);
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