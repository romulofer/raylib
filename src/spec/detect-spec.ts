import { isRaylibProject, FsLike } from '../detect';

// Build a fake filesystem from a flat map of path -> file contents. Directories
// are inferred from the path prefixes.
function fakeFs(files: Record<string, string>): FsLike {
  const dirs = new Set<string>();
  for (const full of Object.keys(files)) {
    const parts = full.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  return {
    readdirSync(dir) {
      const prefix = dir.endsWith('/') ? dir : `${dir}/`;
      const names = new Set<string>();
      const out: { name: string; isDirectory(): boolean }[] = [];
      for (const full of [...Object.keys(files), ...dirs]) {
        if (!full.startsWith(prefix)) continue;
        const rest = full.slice(prefix.length);
        if (rest.includes('/') || rest === '') continue;
        if (names.has(rest)) continue;
        names.add(rest);
        const child = `${prefix}${rest}`;
        out.push({ name: rest, isDirectory: () => dirs.has(child) });
      }
      return out;
    },
    readFileSync(file) {
      const content = files[file];
      if (content === undefined) throw new Error(`ENOENT: ${file}`);
      return content;
    }
  };
}

describe('isRaylibProject', () => {
  it('returns true when a source file includes raylib.h (quoted)', () => {
    const fs = fakeFs({ '/proj/main.c': '#include "raylib.h"\nint main(){}' });
    expect(isRaylibProject('/proj', fs)).toBe(true);
  });

  it('returns true for angle-bracket includes in a nested dir', () => {
    const fs = fakeFs({ '/proj/src/game.cpp': '#include <raylib.h>' });
    expect(isRaylibProject('/proj', fs)).toBe(true);
  });

  it('returns false when no source references raylib', () => {
    const fs = fakeFs({ '/proj/main.c': '#include <stdio.h>' });
    expect(isRaylibProject('/proj', fs)).toBe(false);
  });

  it('skips ignored directories like node_modules', () => {
    const fs = fakeFs({ '/proj/node_modules/x/y.c': '#include "raylib.h"' });
    expect(isRaylibProject('/proj', fs)).toBe(false);
  });
});
