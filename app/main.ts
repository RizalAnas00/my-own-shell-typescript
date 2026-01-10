import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { validTypeCommands } from "./types/validBuiltin";
import { pathCompleteExec } from "./utils/pathLocate";
import { print } from "./utils/print";
import longestCommonPrefix from "./utils/lcp";
import { addHistory } from "./utils/history";

let tabPressedCount: number= 0;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "$ ",
  completer: (line: string) => {
    const tokens: string[] = parseArgs(line);
    const last: string = tokens[tokens.length - 1] || "";

    const builtinHits: string[] = validTypeCommands
    .filter(cmd => cmd.startsWith(last))
    .map(cmd => cmd.trim());

    const pathHits: string[] = pathCompleteExec(last).map(c => c.trim());

    const hits: string[] = [...new Set([...builtinHits, ...pathHits])].sort();

    // no matches → bell
    if (hits.length === 0) {
      tabPressedCount = 0;
      print('\x07');
      return [[], line];
    }

    // single match → autocomplete
    if (hits.length === 1) {
      tabPressedCount = 0;
      return [[hits[0] + " "], line];
    }

    // multiple matches with longest common prefix (partial completion)
    const lcp: string = longestCommonPrefix(hits);
    if (lcp.length > last.length) {
      tabPressedCount = 0;
      return [[lcp], line];
    }

    // multiple matches
    if (tabPressedCount === 0) {
      tabPressedCount++;
      print('\x07');
      return [[], line];
    }

    // second tab
    tabPressedCount = 0;
    print(`\n${hits.join("  ")}\n$ ${line}`);
    return [[], line];
  }
});

rl.on("line", (line) => {
  tabPressedCount = 0;
  const tokens = parseArgs(line.trim());
  execute(tokens, () => toHistory(line, () => rl.prompt()));
});

rl.prompt();

function toHistory(line: string, prompt: () => void): void {
  if(line.startsWith("history")) return prompt();
  addHistory(line);
  prompt();
}
