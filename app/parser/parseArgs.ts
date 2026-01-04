export function parseArgs(input: string): string[] {
  const args: string[] = [];
  let current = "";

  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      if (inSingle) {
        current += "\\";
      } else if (inDouble) {
        const next = input[i + 1];
        if (next === "\\" || next === '"' || next === "$" || next === "`") {
          escaped = true;
        } else {
          current += "\\";
        }
      } else {
        escaped = true;
      }
      continue;
    }

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

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
  stdoutAppend: boolean;
  stderrFile: string | null;
  stderrAppend: boolean;
}

export function parseRedirection(tokens: string[]): RedirectionResult {
  const args: string[] = [];

  let stdoutFile: string | null = null;
  let stderrFile: string | null = null;
  let stdoutAppend = false;
  let stderrAppend = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    /* ---------- STDOUT ---------- */

    // > or 1>
    if ((t === ">" || t === "1>") && tokens[i + 1]) {
      stdoutFile = tokens[i + 1];
      stdoutAppend = false;
      i++;
      continue;
    }

    // >> or 1>>
    if ((t === ">>" || t === "1>>") && tokens[i + 1]) {
      stdoutFile = tokens[i + 1];
      stdoutAppend = true;
      i++;
      continue;
    }

    /* ---------- STDERR ---------- */

    // 2>
    if (t === "2>" && tokens[i + 1]) {
      stderrFile = tokens[i + 1];
      stderrAppend = false;
      i++;
      continue;
    }

    // 2>>
    if (t === "2>>" && tokens[i + 1]) {
      stderrFile = tokens[i + 1];
      stderrAppend = true;
      i++;
      continue;
    }

    args.push(t);
  }

  return {
    args,
    stdoutFile,
    stdoutAppend,
    stderrFile,
    stderrAppend
  };
}
