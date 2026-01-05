import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { print } from "./utils/print";
import { validTypeCommands } from "./types/validBuiltin";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
  completer: (line: string) => {
    const tokens = parseArgs(line);
    const hits = validTypeCommands.filter(c =>
      c.startsWith(tokens[0] || "")
    );
    return [hits.length ? hits : validTypeCommands, line];
  }
});

function loop() {
  print("$ ");

  rl.question("", (line) => {
    const tokens = parseArgs(line.trim());
    execute(tokens, loop);
  });
}

loop();
