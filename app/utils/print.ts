import { writeFileSync, appendFileSync } from "fs";

let outputTarget: string | null = null;

export function setOutputTarget(path: string | null) {
  outputTarget = path;
  if (path) writeFileSync(path, ""); 
}

export function print(message: string): void {
  if (outputTarget) {
    appendFileSync(outputTarget, message);
  } else {
    process.stdout.write(message);
  }
}