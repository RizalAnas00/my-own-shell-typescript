import { tryBuiltin } from "./builtin";
// import { executeExternal } from "./external";
import { handleCustomCommand } from "../types/command";
import { setOutputTarget } from "../utils/print";
import type { ParsedCommand } from "../parser/parseArgs";

export function execute(parsed: ParsedCommand, next: () => void) {
  const { args, redirectFile } = parsed;

  if (args.length === 0) {
    next();
    return;
  }

  // Set target output sebelum eksekusi
  if (redirectFile) {
    setOutputTarget(redirectFile);
  }

  const finalize = () => {
    setOutputTarget(null); // Kembalikan ke terminal setelah selesai
    next();
  };

  if (tryBuiltin(args)) {
    finalize();
    return;
  }

  handleCustomCommand(args, finalize, redirectFile);
}
