import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { validTypeCommands } from "./types/validBuiltin";
import { print } from "./utils/print";
import { pathLocateExec } from "./utils/pathLocate";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "$ ",
  completer: (line: string) => {
    const tokens = parseArgs(line);
    const last = tokens[tokens.length - 1] || "";

    const hits = validTypeCommands.filter(cmd =>
      cmd.startsWith(last)
    ).map(cmd => cmd + " ");

    if (!hits.length) {
      const pathHit = pathLocateExec([last]);
      if (pathHit) {
        return [[last + " "], last];
      } else {
        print('\x07'); // bell character  
      }
    }

    return [
      hits.length ? hits : validTypeCommands.map(c => c + " "),
      last
    ];

  }
});

rl.on("line", (line) => {
  const tokens = parseArgs(line.trim());
  execute(tokens, () => rl.prompt());
});

rl.prompt();
