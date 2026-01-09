import { appendFileSync } from "fs";
import path from "path";

export let historyCommands: string[] = [];

export function addHistory(command: string): void {
    historyCommands.push(command);
    const historyFile = path.join(process.env.HOME || "", ".bash_history");
    appendFileSync(historyFile, `${command}\n`);
}

export function clearHistory(): void {
    historyCommands = [];
}

export function getAllHistory(): string[] {
    return historyCommands;
}