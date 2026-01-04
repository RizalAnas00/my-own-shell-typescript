export function parseArgs(input: string): string[] {
  const args: string[] = [];
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
        args.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

export interface RedirectionResult {
  args: string[];
  stdoutFile: string | null;
  stderrFile: string | null;
}

export function parseRedirection(tokens: string[]): RedirectionResult {
  const args: string[] = [];
  let stdoutFile: string | null = null;
  let stderrFile: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // redirect stdout and overwrite / create one
    if ((t === ">" || t === "1>") && tokens[i + 1]) {
      stdoutFile = tokens[i + 1];
      i++;
      continue;
    }

    // redirect stdout and append
    else if (t === ">>" || t === "1>>" && tokens[i + 1]) {
      stdoutFile = tokens[i + 1];
      i++;
      continue;
    }

    // redirect stderr and overwrite / create one
    else if (t === "2>" && tokens[i + 1]) {
      stderrFile = tokens[i + 1];
      i++;
      continue;
    }

    // redirect stderr and append
    else if (t === ">>" || t === "2>>" && tokens[i + 1]) {
      stdoutFile = stderrFile = tokens[i + 1];
      i++;
      continue;
    }

    args.push(t);
  }

  return { args, stdoutFile, stderrFile };
}
