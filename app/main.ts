import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const validTypeCommands: string[] = ["echo", "type", "exit"];

function handleTypeCommand(command: string): void {
  if (!validTypeCommands.includes(command)) {
    rl.write(`${command}: not found\n`);
    return;
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