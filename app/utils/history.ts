import { appendFileSync, readFileSync } from "fs";
import path from "path";

export let historyCommands: string[] = [];

export const histFile =
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
}

export function clearHistory(): void {
  historyCommands = [];
}

export function getAllHistory(): string[] {
  let fileHistory: string[] = [];

  try {
    const content = readFileSync(histFile, "utf-8");
    fileHistory = content.split("\n").filter(Boolean);
  } catch {}

  return [...fileHistory, ...historyCommands];
}

export function appendHistory(targetFile?: string) {
  const histories = getAllHistory();
  const newEntries = histories.slice(lastHistoryWriteIndex);

  if (newEntries.length === 0) return;

  const file =
    targetFile ??
    process.env.HISTFILE ??
    path.join(process.env.HOME || "", ".bash_history");

  appendFileSync(file, newEntries.join("\n") + "\n");
  lastHistoryWriteIndex = histories.length;
}
