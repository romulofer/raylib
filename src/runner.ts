import { BufferedProcess } from 'atom';

export type SpawnOptions = {
  command: string;
  args: string[];
  options: { cwd: string };
  stdout: (data: string) => void;
  stderr: (data: string) => void;
  exit: (code: number) => void;
};

export type SpawnHandle = { kill(): void };
export type Spawn = (options: SpawnOptions) => SpawnHandle;

export type RunHandlers = {
  onOutput?: (data: string) => void;
  onExit?: (code: number) => void;
};

// Default spawner: Atom's BufferedProcess. Cast because @types/atom's option
// shape is looser than ours.
const DEFAULT_SPAWN: Spawn = (options) =>
  new BufferedProcess(options as any) as unknown as SpawnHandle;

// Run `command` (a shell string, so `&&` works) in `cwd`. Streams output via
// handlers. `spawn` is injectable for tests.
export function runProject(
  command: string,
  cwd: string,
  handlers: RunHandlers = {},
  spawn: Spawn = DEFAULT_SPAWN
): SpawnHandle {
  if (!command || command.trim() === '') {
    throw new Error('raylib: run command is empty');
  }
  const onOutput = handlers.onOutput ?? (() => {});
  const onExit = handlers.onExit ?? (() => {});
  return spawn({
    command: '/bin/sh',
    args: ['-c', command],
    options: { cwd },
    stdout: (data) => onOutput(data),
    stderr: (data) => onOutput(data),
    exit: (code) => onExit(code)
  });
}
