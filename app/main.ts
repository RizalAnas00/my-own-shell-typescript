import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { validTypeCommands } from "./types/validBuiltin";
import { pathCompleteExec } from "./utils/pathLocate";

let lastLine = "";
let tabPressCount = 0;

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

    // Track TAB presses for the same line
    if (line !== lastLine) {
      tabPressCount = 0;
      lastLine = line;
    }
    tabPressCount++;

    if (!hits.length) {
      if (tabPressCount === 1) {
        process.stdout.write('\x07'); // bell character on first TAB if no matches
      }
    } else if (tabPressCount === 2) {
      // Sort hits alphabetically and display
      const sorted = hits.map(h => h.trim()).sort().join("  ");
      process.stdout.write(`\n${sorted}\n`);
      // Show prompt again with the original command prefix
      process.stdout.write(rl.prompt.toString());
      process.stdout.write(line);
    }

    return [hits, last];
  }
});

rl.on("line", (line) => {
  const tokens = parseArgs(line.trim());
  execute(tokens, () => rl.prompt());
});

rl.prompt();
