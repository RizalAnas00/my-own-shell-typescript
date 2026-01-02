import { tryBuiltin } from "./builtin";
import { handleCustomCommand } from "../types/command";
import { parseRedirection } from "../parser/parseArgs";
import { openSync, closeSync } from "fs";

export function execute(tokens: string[], next: () => void) {
  if (tokens.length === 0) {
    next();
    return;
  }

  const { args, stdoutFile } = parseRedirection(tokens);
  const fd = stdoutFile ? openSync(stdoutFile, "w") : null;

  if (tryBuiltin(args, fd)) {
    if (fd !== null) closeSync(fd);
    next();
    return;
  }

  handleCustomCommand(args, next, fd);
}
