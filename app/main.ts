import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function handleCommand(command: string, args: string[]) {
  switch (command) {
    case "echo":
        rl.write(args.join(" ") + "\n");
        break;
    default:
        rl.write(`${command}: command not found\n`);
  }
}

function loop() {
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