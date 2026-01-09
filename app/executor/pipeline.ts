import { spawnCommand } from "./spawnCommand";

export default function executePipeline(
  commands: string[][],
  outFd: number | null,
  errFd: number | null,
  done: () => void
) {
  const procs = [];

  for (let i = 0; i < commands.length; i++) {
    const [cmd, ...args] = commands[i];

    const isFirst = i === 0;
    const isLast = i === commands.length - 1;

    const stdio = [
      isFirst ? "inherit" : "pipe",
      isLast ? (outFd ?? "inherit") : "pipe",
      errFd ?? "inherit",
    ];

    const p = spawnCommand(commands[i], stdio);
    if (!p) {
      console.log(`${cmd}: command not found`);
      return done();
    }

    if (i > 0) {
      procs[i - 1].stdout!.pipe(p.stdin!);
    }

    procs.push(p);
  }

  let exited = 0;
  for (const p of procs) {
    p.on("exit", () => {
      exited++;
      if (exited === procs.length) done();
    });
  }
}