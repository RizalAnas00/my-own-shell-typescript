import { tryBuiltin } from "./builtin";
import { handleCustomCommand } from "../types/command";
import { parseRedirection } from "../parser/parseArgs";
import { createWriteStream } from "fs";

export function execute(tokens: string[], next: () => void) {
  if (tokens.length === 0) {
    next();
    return;
  }

  const { args, stdoutFile } = parseRedirection(tokens);

  const output =
    stdoutFile ? createWriteStream(stdoutFile, { flags: "w" }) : null;

  if (tryBuiltin(args, output)) {
    if (output) output.end();
    next();
    return;
  }

  handleCustomCommand(args, next, output);
}
