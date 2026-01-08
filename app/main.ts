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

    const builtinHits = validTypeCommands
    .filter(cmd => cmd.startsWith(last))
    .map(cmd => cmd.trim());

    const pathHits = pathCompleteExec(last).map(c => c.trim());

    const hits = [...new Set([...builtinHits, ...pathHits])].sort();

    // no matches → bell
    if (hits.length === 0) {
      tabPressedCount = 0;
      process.stdout.write('\x07');
      return [[], line];
    }

    // single match → autocomplete
    if (hits.length === 1) {
      tabPressedCount = 0;
      return [[hits[0] + " "], line];
    }

    // multiple matches
    if (tabPressedCount === 0) {
      tabPressedCount++;
      process.stdout.write('\x07');
      return [[], line];
    }

    // second tab
    tabPressedCount = 0;
    process.stdout.write(`\n${hits.join("  ")}\n$ ${line}`);
    return [[], line];
  }
});

rl.on("line", (line) => {
  tabPressedCount = 0;
  const tokens = parseArgs(line.trim());
  execute(tokens, () => rl.prompt());
});

rl.prompt();
