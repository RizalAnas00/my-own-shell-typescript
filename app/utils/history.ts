import { readFileSync } from "fs";
import path from "path";

export let historyCommands: string[] = [];

export function addHistory(command: string): void {
    historyCommands.push(command);
    // const historyFile = path.join(process.env.HOME || "", ".bash_history");
    // appendFileSync(historyFile, `${command}\n`);
}

export function clearHistory(): void {
    historyCommands = [];
}

export function getAllHistory(): string[] {
    let allHistories: string[] = [];

    const histFile =
        process.env.HISTFILE ??
        path.join(process.env.HOME || "", ".bash_history");

    try {
        const content = readFileSync(histFile, "utf-8");
        allHistories = content.split("\n").filter(Boolean);
    } catch {}

    for (const cmd of historyCommands) {
        allHistories.push(cmd);
    }

    return allHistories;
}
