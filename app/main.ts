import path from "path";
import { accessSync, constants, readFileSync } from "fs";
import { createInterface } from "readline";
import { spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
  // output: process.stdout,
});

const validTypeCommands: string[] = [
  "echo", 
  "type", 
  "exit", 
  "pwd",
  "cd",
  "cat"
];

// ----------------- ERROR HANDLING ---------------- //

function commandNotFound(command: string): void {
  print(`${command}: command not found\n`);
}

function typeNotFound(command: string): void {
  print(`${command}: not found\n`);
}

// ----------------- ERROR HANDLING END ---------------- //


// ----------------- Utils ---------------- //
function print(text: string): void {
  process.stdout.write(text);
}
// ----------------- Utils END ---------------- //


// ----------------- Commands Handling ---------------- //
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

function handleWorkingDirectory(args: string[]): void {
  if(args[0] == "~") {
    print(process.env.HOME + "\n");
    return;
  }

  print(process.cwd() + "\n");
}

function handleChangeDirectory(args: string[]): void {
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

function handleEchoCommand(args: string[]): void {
  print(args.join(" ") + "\n");
}

function handleCatCommand(args: string[]): void {
  try {
    for (const filePath of args) {
      const data = readFileSync(filePath, 'utf-8');
      print(data);
    }
  } catch (err) {
    print(`No such file or directory\n`);
  }
}
// ----------------- Commands Handling END ---------------- //

// ---------------- Parser ---------------- //
function parseArgs(input: string): string[] {
  const result: string[] = [];
  let current = "";
  let inSingleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === "'") {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (ch === " " && !inSingleQuote) {
      if (current !== "") {
        result.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }

  if (current !== "") {
    result.push(current);
  }

  return result;
}
// ---------------- Parser END ---------------- //
function handleCommand(command: string, args: string[]): void {
  const parsedArgs = parseArgs(args.join(" "));
  switch (command) {
    case "echo":
      handleEchoCommand(parsedArgs);
      loop();
      break;
    case "type":
      if (args.length === 0) {
        print("type: missing operand\n");
      } else {
        handleTypeCommand(args);
      }
      loop();
      break;
    case "pwd":
      handleWorkingDirectory(args);
      loop();
      break;
    case "cd":
      handleChangeDirectory(args);
      loop();
      break;
    case "cat":
      handleCatCommand(parsedArgs);
      loop();
      break;
    default:
      handleCustomCommand([command, ...args]);
  }
}

function loop(): void {
  print("$ ");

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