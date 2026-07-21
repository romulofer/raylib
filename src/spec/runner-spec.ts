import { runProject, SpawnOptions } from '../runner';

describe('runProject', () => {
  it('spawns the command through /bin/sh in the given cwd', () => {
    let captured: SpawnOptions | null = null;
    const fakeSpawn = (options: SpawnOptions) => {
      captured = options;
      return { kill() {} };
    };

    runProject('make && ./game', '/proj', {}, fakeSpawn);

    expect(captured!.command).toBe('/bin/sh');
    expect(captured!.args).toEqual(['-c', 'make && ./game']);
    expect(captured!.options.cwd).toBe('/proj');
  });

  it('routes stdout, stderr, and exit to the handlers', () => {
    const output: string[] = [];
    let exitCode: number | null = null;
    const fakeSpawn = (options: SpawnOptions) => {
      options.stdout('out ');
      options.stderr('err');
      options.exit(0);
      return { kill() {} };
    };

    runProject('echo hi', '/proj', {
      onOutput: (data) => output.push(data),
      onExit: (code) => { exitCode = code; }
    }, fakeSpawn);

    expect(output.join('')).toBe('out err');
    expect(exitCode).toBe(0);
  });

  it('throws for an empty command', () => {
    expect(() => runProject('   ', '/proj', {}, () => ({ kill() {} }))).toThrow();
  });
});
