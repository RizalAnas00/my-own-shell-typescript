import { accessSync, constants, readdirSync } from "fs";
import path from "path";

const paths: string[] = process.env.PATH?.split(path.delimiter) || [];

export function pathLocateExec(command: string[]): string | null {
  // Real look up of executable in PATH Env in this PC
  for (const p of paths) {
    const fullPath = path.join(p, command[0]);
    try {
      accessSync(fullPath, constants.X_OK);
      // return `${command} is ${fullPath}\n`;
      return fullPath;
    } catch {
      // ignore
    }
  }

  return null;
}

export function pathCompleteExec(prefix: string): string[] {
  const results: string[] = [];

  for (const p of paths) {
    let files: string[];
    try {
      files = readdirSync(p);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.startsWith(prefix)) continue;

      const full = path.join(p, file);
      try {
        accessSync(full, constants.X_OK);
        results.push(file + " ");
      } catch {
        // not executable
      }
    }
  }

  return [...new Set(results)]; // remove duplicates
}
