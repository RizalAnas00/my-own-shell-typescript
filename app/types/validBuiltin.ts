export const validTypeCommands: string[] = [
  "echo", 
  "type", 
  "exit", 
  "pwd",
  "cd",
  "tail",
  "wc",
  "head",
  "cat",
  "ls",
  "history",
];

export const PIPELINE_SAFE_BUILTINS = new Set([
  "pwd",
  "type",
]);

export const STATEFUL_BUILTINS = new Set([
  "cd",
  "exit",
]);

export const BUILTINS = new Set([...PIPELINE_SAFE_BUILTINS, ...STATEFUL_BUILTINS]);
