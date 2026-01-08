import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { validTypeCommands } from "./types/validBuiltin";
import { pathCompleteExec } from "./utils/pathLocate";

let tabPressedCount = 0;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "$ ",
  completer: (line: string) => {
    const tokens = parseArgs(line);
    const last = tokens[tokens.length - 1] || "";

    const builtinHits = validTypeCommands.filter(cmd =>
      cmd.startsWith(last)
    ).map(cmd => cmd + " ");

    const pathHits = pathCompleteExec(last);

    const hits = [...builtinHits, ...pathHits];

    if (!hits.length) {
      process.stdout.write('\x07'); // bell character
    } 
    
    if (hits.length >= 1) {
      return [hits, last];    
    }

    if (tabPressedCount == 0) {
      tabPressedCount++;

      process.stdout.write('\x07');
      return hits;
    } else if (tabPressedCount >= 1) {
      tabPressedCount = 0;
      process.stdout.write(`\n${hits.join(" ")}\n$ ${line}`);
    }

  }
});

rl.on("line", (line) => {
  const tokens = parseArgs(line.trim());
  execute(tokens, () => rl.prompt());
});

rl.prompt();
