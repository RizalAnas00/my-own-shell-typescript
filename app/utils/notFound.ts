import { print } from "../utils/print";

export function commandNotFound(command: string): void {
  print(`${command}: command not found\n`);
}

export function typeNotFound(command: string): void {
  print(`${command}: not found\n`);
}