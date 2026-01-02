import { Writable } from "stream";
import { print } from "../utils/print";
import {
  handleCatCommand,
  handleChangeDirectory,
  handleTypeCommand,
} from "../types/command";

export function tryBuiltin(
  tokens: string[],
  out: Writable | null
): boolean {
  const cmd = tokens[0];
  const args = tokens.slice(1);

  const write = (msg: string) => {
    if (out) out.write(msg);
    else print(msg);
  };

  switch (cmd) {
    case "echo":
      write(args.join(" ") + "\n");
      return true;

    case "pwd":
      write(process.cwd() + "\n");
      return true;

    case "cd":
      handleChangeDirectory(args);
      return true;

    case "type":
      if (!args[0]) write("type: missing operand\n");
      else handleTypeCommand(args, write);
      return true;

    case "cat":
      handleCatCommand(args, write);
      return true;

    case "exit":
      process.exit(0);

    default:
      return false;
  }
}
