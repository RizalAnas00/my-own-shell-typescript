import { tryBuiltin } from "./builtin";
import { handleCustomCommand } from "../types/command";
import { parseRedirection } from "../parser/parseArgs";
import { openSync, closeSync } from "fs";

export function execute(tokens: string[], next: () => void) {
  if (tokens.length === 0) {
    next();
    return;
  }

  const { args, stdoutFile, stderrFile } = parseRedirection(tokens);

  const outFd = stdoutFile ? openSync(stdoutFile, "w") : null;
  const errFd = stderrFile ? openSync(stderrFile, "w") : null;

  if (tryBuiltin(args, outFd, errFd)) {
    if (outFd !== null) closeSync(outFd);
    if (errFd !== null) closeSync(errFd);
    next();
    return;
  }

  handleCustomCommand(args, next, outFd, errFd);
}
