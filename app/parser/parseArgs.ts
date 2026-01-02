export interface ParsedCommand {
  args: string[];
  redirectFile: string | null;
}

export function parseArgs(input: string):ParsedCommand {
  const tokens: string[] = [];
  let current = "";

  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // escape
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    // backslash
    if (ch === "\\") {
      if (inSingle) {
        // literal inside single quotes
        current += "\\";
      } else if (inDouble) {
        // only escape specific chars in double quotes
        const next = input[i + 1];
        if (next === "\\" || next === '"' || next === "$" || next === "`") {
          escaped = true;
        } else {
          current += "\\";
        }
      } else {
        // outside quotes = escape anything
        escaped = true;
      }
      continue;
    }

    // single quote
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    // double quote
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    // argument separator
    if (ch === " " && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  const args: string[] = [];
  let redirectFile: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === ">" || tokens[i] === "1>") {
      redirectFile = tokens[i + 1];
      break;
    }
    args.push(tokens[i]);
  }

  return { args, redirectFile };
}