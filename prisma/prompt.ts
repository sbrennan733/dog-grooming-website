import readline from "node:readline";

// Small helpers for the guided scripts: ask questions in the terminal, with
// the option of hiding what is typed (for passwords and database addresses).
// Input is queued so pasted or piped lines are never lost.

export interface Prompter {
  ask: (question: string, hidden?: boolean) => Promise<string>;
  close: () => void;
}

export function createPrompter(): Prompter {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const queuedLines: string[] = [];
  let waiting: ((line: string) => void) | undefined;
  let muted = false;

  rl.on("line", (line) => {
    if (waiting) {
      const resolve = waiting;
      waiting = undefined;
      resolve(line);
    } else {
      queuedLines.push(line);
    }
  });

  // While muted, the terminal's echo of what you type is dropped.
  const writable = rl as unknown as { _writeToOutput: (text: string) => void };
  const originalWrite = writable._writeToOutput.bind(rl);
  writable._writeToOutput = (text: string) => {
    if (!muted) {
      originalWrite(text);
    }
  };

  return {
    ask(question, hidden = false) {
      return new Promise((resolve) => {
        process.stdout.write(question);
        muted = hidden;

        const deliver = (line: string) => {
          muted = false;
          if (hidden) {
            process.stdout.write("\n");
          }
          resolve(line.trim());
        };

        const queued = queuedLines.shift();
        if (queued !== undefined) {
          deliver(queued);
        } else {
          waiting = deliver;
        }
      });
    },
    close() {
      rl.close();
    },
  };
}

// Pulls the address out of whatever was pasted: the bare address, a
// DATABASE_URL="..." line, or a `psql '...'` command.
export function extractDatabaseUrl(pasted: string): string | undefined {
  return pasted.match(/postgres(?:ql)?:\/\/[^\s'"]+/)?.[0];
}

export function describeDatabaseUrl(
  url: string
): { host: string; user: string; database: string } | undefined {
  try {
    const parsed = new URL(url);
    if (!parsed.username || !parsed.password) {
      return undefined;
    }
    return {
      host: parsed.hostname,
      user: parsed.username,
      database: parsed.pathname.slice(1),
    };
  } catch {
    return undefined;
  }
}
