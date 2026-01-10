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
    const HISTPATH = path.join(process.env.HOME || "", ".bash_history");
    try {
        const content = readFileSync(HISTPATH, "utf-8");
        allHistories = content.split("\n");
    } catch {
        // ignore
    }

    new Array(historyCommands.length).fill("").map((_, i) => allHistories.push(historyCommands[i]));
    return allHistories;
}