import { appendFileSync, readFileSync } from "fs";
import path from "path";

export let historyCommands: string[] = [];

const histFile =
    process.env.HISTFILE ??
    path.join(process.env.HOME || "", ".bash_history");

export let lastHistoryWriteIndex = 0;

export function initHistoryIndex() {
  try {
    const content = readFileSync(histFile, "utf-8");
    lastHistoryWriteIndex = content.split("\n").filter(Boolean).length;
  } catch {
    lastHistoryWriteIndex = 0;
  }
}

export function addHistory(command: string): void {
    historyCommands.push(command);
    // try {
    //     appendFileSync(histFile, `${command}\n`);
    // } catch {
    //     // ignore
    // }
}

export function clearHistory(): void {
    historyCommands = [];
}

export function getAllHistory(): string[] {
    let allHistories: string[] = [];

    try {
        const content = readFileSync(histFile, "utf-8");
        allHistories = content.split("\n").filter(Boolean);
    } catch {}

    for (const cmd of historyCommands) {
        allHistories.push(cmd);
    }

    return allHistories;
}
