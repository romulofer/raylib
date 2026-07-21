import * as path from 'path';
import { loadApi } from '../api';

const FIXTURE = path.join(__dirname, 'fixtures', 'raylib_api.sample.json');

describe('ApiIndex', () => {
  let api: ReturnType<typeof loadApi>;

  beforeEach(() => {
    api = loadApi(FIXTURE);
  });

  describe('lookup', () => {
    it('finds a function by exact name', () => {
      const rec = api.lookup('InitWindow');
      expect(rec).toBeTruthy();
      expect(rec!.kind).toBe('function');
      if (rec!.kind === 'function') {
        expect(rec!.returnType).toBe('void');
        expect(rec!.params.length).toBe(3);
      }
    });

    it('finds a struct, an enum value, and a define by name', () => {
      expect(api.lookup('Color')!.kind).toBe('struct');
      expect(api.lookup('KEY_SPACE')!.kind).toBe('enum');
      expect(api.lookup('RAYLIB_VERSION')!.kind).toBe('define');
    });

    it('returns undefined for an unknown name', () => {
      expect(api.lookup('NopeNotReal')).toBeUndefined();
    });
  });

  describe('match', () => {
    it('matches by case-insensitive prefix', () => {
      const names = api.match('init').map((r) => r.name);
      expect(names).toContain('InitWindow');
      expect(names).toContain('InitAudioDevice');
    });

    it('ranks prefix matches alphabetically', () => {
      const names = api.match('Init').map((r) => r.name);
      expect(names[0]).toBe('InitAudioDevice');
    });

    it('respects the result cap', () => {
      expect(api.match('', 2).length).toBe(2);
    });
  });

  describe('signatureFor', () => {
    it('builds a signature object for a function', () => {
      const sig = api.signatureFor('InitWindow');
      expect(sig!.label).toBe('void InitWindow(int width, int height, const char * title)');
      expect(sig!.params.map((p) => p.label)).toEqual(['int width', 'int height', 'const char * title']);
      expect(sig!.documentation).toBe('Initialize window and OpenGL context');
    });

    it('returns undefined for a non-function', () => {
      expect(api.signatureFor('Color')).toBeUndefined();
      expect(api.signatureFor('Nope')).toBeUndefined();
    });
  });

  describe('corrupt input', () => {
    it('throws for missing files (caller handles soft)', () => {
      expect(() => loadApi('/no/such/file.json')).toThrow();
    });
  });
});
