import { writeSync } from "fs";
import { print } from "../utils/print";
import {
  handleCatCommand,
  handleChangeDirectory,
  handleHistoryCommand,
  handleTypeCommand
} from "../types/command";
import type { error } from "console";
import { addHistory, appendHistory } from "../utils/history";

export function tryBuiltin(
  tokens: string[],
  stdoutFd: number | null,
  stderrFd: number | null
): boolean {
  const cmd = tokens[0];
  const args = tokens.slice(1);

  const writeOut = (msg: string) => {
    if (stdoutFd !== null) writeSync(stdoutFd, msg);
    else print(msg);
  };

  const writeErr = (msg: string) => {
    if (stderrFd !== null) writeSync(stderrFd, msg);
    else print(msg);
  };

  switch (cmd) {
    case "echo":
      writeOut(args.join(" ") + "\n");
      return true;

    case "pwd":
      writeOut(process.cwd() + "\n");
      return true;

    case "cd":
      handleChangeDirectory(args, writeErr);
      return true;

    case "type":
      if (!args[0]) writeOut("type: missing operand\n");
      else handleTypeCommand(args, writeOut);
      return true;

    case "cat":
      handleCatCommand(args, writeOut, writeErr);
      return true;

    case "history":
      handleHistoryCommand(args, writeOut);
      return true;

    case "exit":
      addHistory("exit")
      appendHistory();
      process.exit(0);

    default:
      return false;
  }
}
