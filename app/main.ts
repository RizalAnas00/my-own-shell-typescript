import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { print } from "./utils/print";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function loop() {
  print("$ ");
  rl.question("", (line) => {
    const tokens = parseArgs(line.trim());
    execute(tokens, loop);
  });
}

loop();
