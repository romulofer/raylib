import * as fs from 'fs';
import * as path from 'path';

type DirEnt = { name: string; isDirectory(): boolean };

export type FsLike = {
  readdirSync(dir: string): DirEnt[];
  readFileSync(file: string, encoding: 'utf8'): string;
};

const SOURCE_RE = /\.(c|cc|cpp|cxx|h|hpp)$/i;
const RAYLIB_INCLUDE_RE = /#\s*include\s*[<"]raylib\.h[>"]/;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'build', '.build', 'out', 'lib']);
const MAX_FILES = 400;

// Real-fs adapter passed as the default. `withFileTypes` gives us DirEnt objects.
const REAL_FS: FsLike = {
  readdirSync: (dir) => fs.readdirSync(dir, { withFileTypes: true }) as unknown as DirEnt[],
  readFileSync: (file, encoding) => fs.readFileSync(file, encoding)
};

// Walk `root`, returning true as soon as a source file includes raylib.h.
// `deps` is injectable for tests.
export function isRaylibProject(root: string, deps: FsLike = REAL_FS): boolean {
  let scanned = 0;
  const stack: string[] = [root];

  while (stack.length > 0) {
    const dir = stack.pop() as string;
    let entries: DirEnt[];
    try {
      entries = deps.readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(full);
        continue;
      }
      if (!SOURCE_RE.test(entry.name)) continue;
      if (++scanned > MAX_FILES) return false;
      let text: string;
      try {
        text = deps.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      if (RAYLIB_INCLUDE_RE.test(text)) return true;
    }
  }
  return false;
}
