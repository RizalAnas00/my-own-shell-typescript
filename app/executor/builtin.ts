import { print } from "../utils/print";
import { handleCatCommand,
    handleChangeDirectory,
    handleCustomCommand,
    handleEchoCommand,
    handleTypeCommand,
    handleWorkingDirectory
 } from "../types/command";

export function tryBuiltin(tokens: string[]): boolean {
  const cmd = tokens[0];
  const args = tokens.slice(1);

  switch (cmd) {
    case "echo":
        handleEchoCommand(args);
        return true;

    case "pwd":
        handleWorkingDirectory(args);
        return true;

    case "cd":
        handleChangeDirectory(args);
        return true;

    case "type":
        if (!args[0]) {
            print("type: missing operand\n");
        } else {
            handleTypeCommand(args);
        }
        return true;

    case "cat":
        handleCatCommand(args);
        return true;

    case "exit":
        process.exit(0);

    default:
        handleCustomCommand(tokens, () => {});
        return true;
  }

  return false;
}
