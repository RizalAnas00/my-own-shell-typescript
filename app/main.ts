import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { print } from "./utils/print";
import { validTypeCommands } from "./types/validBuiltin";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function loop() {
  print("$ ");

  rl.on('line', (line) => {
    const tokens = parseArgs(line.trim());
    const hints = validTypeCommands.filter(cmd => cmd.startsWith(tokens[0] || ""));
    
    return [hints.length ? hints : validTypeCommands, line];
  });

  rl.question("", (line) => {
    const tokens = parseArgs(line.trim());
    execute(tokens, loop);
  });
}

loop();
