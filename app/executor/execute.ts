import { tryBuiltin } from "./builtin";
import { handleCustomCommand } from "../types/command";
import { parseRedirection } from "../parser/parseArgs";
import { openSync, closeSync } from "fs";
import executePipeline from "./pipeline";

export function execute(tokens: string[], next: () => void) {
  if (!tokens.length) return next();

  const {
    args,
    stdoutFile,
    stderrFile,
    stdoutAppend,
    stderrAppend,
  } = parseRedirection(tokens);

  const pipelineParts = splitPipeline(args);
  const isPipeline = pipelineParts.length > 1;

  const outFd = stdoutFile
    ? openSync(stdoutFile, stdoutAppend ? "a" : "w")
    : null;

  const errFd = stderrFile
    ? openSync(stderrFile, stderrAppend ? "a" : "w")
    : null;

  if (!isPipeline && tryBuiltin(pipelineParts[0], outFd, errFd)) {
    outFd && closeSync(outFd);
    errFd && closeSync(errFd);
    return next();
  }

  executePipeline(
    pipelineParts,
    outFd,
    errFd,
    () => {
      outFd && closeSync(outFd);
      errFd && closeSync(errFd);
      next();
    }
  );
}

function splitPipeline(tokens: string[]): string[][] {
  const result: string[][] = [];
  let current: string[] = [];

  for (const t of tokens) {
    if (t === "|") {
      result.push(current);
      current = [];
    } else {
      current.push(t);
    }
  }

  if (current.length) result.push(current);
  return result;
}
