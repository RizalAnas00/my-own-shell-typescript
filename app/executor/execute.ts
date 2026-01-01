import { tryBuiltin } from "./builtin";
import { executeExternal } from "./external";

export function execute(tokens: string[], next: () => void) {
  if (tokens.length === 0) {
    next();
    return;
  }

  if (tryBuiltin(tokens)) {
    next();
    return;
  }

  executeExternal(tokens, next);
}
