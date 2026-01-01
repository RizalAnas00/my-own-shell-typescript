import { tryBuiltin } from "./builtin";
import { executeExternal } from "./external";
import { handleCustomCommand } from "../types/command";

export function execute(tokens: string[], next: () => void) {
  if (tokens.length === 0) {
    next();
    return;
  }

  if (tryBuiltin(tokens)) {
    next();
    return;
  }

  handleCustomCommand(tokens, next);
}
