import { createInterface } from "readline";
import { parseArgs } from "./parser/parseArgs";
import { execute } from "./executor/execute";
import { validTypeCommands } from "./types/validBuiltin";

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
    );

    return [hits.length ? hits : validTypeCommands.map(cmd => cmd + " "), last];
  }
});

rl.on("line", (line) => {
  const tokens = parseArgs(line.trim());
  execute(tokens, () => rl.prompt());
});

rl.prompt();
