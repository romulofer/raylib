import * as path from 'path';
import { loadApi } from '../api';
import { createSignatureHelpProvider } from '../signature-help';
import { createDatatipProvider } from '../datatip';

const FIXTURE = path.join(__dirname, 'fixtures', 'raylib_api.sample.json');

// Minimal fake editor: the word under any position is fixed per test.
function fakeEditor(word: string): any {
  return {
    getBuffer() {
      return {
        getWordAt: () => ({ getText: () => word, range: [[0, 0], [0, word.length]] })
      };
    }
  };
}

describe('raylib optional services', () => {
  let api: ReturnType<typeof loadApi>;

  beforeEach(() => {
    api = loadApi(FIXTURE);
  });

  describe('signature-help', () => {
    let service: ReturnType<typeof createSignatureHelpProvider>;
    beforeEach(() => {
      service = createSignatureHelpProvider(api);
    });

    it('declares C/C++ grammar scopes and trigger characters', () => {
      expect(service.grammarScopes).toContain('source.c');
      expect(service.grammarScopes).toContain('source.cpp');
      expect(service.triggerCharacters.has('(')).toBe(true);
    });

    it('returns a signature for a known function symbol', async () => {
      const help = await service.getSignatureHelp(fakeEditor('InitWindow'), [0, 5]);
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toBe('void InitWindow(int width, int height, const char * title)');
      expect(help!.signatures[0].parameters.map((p) => p.label)).toEqual([
        'int width',
        'int height',
        'const char * title'
      ]);
    });

    it('returns null for a non-function symbol', async () => {
      expect(await service.getSignatureHelp(fakeEditor('Color'), [0, 2])).toBeNull();
      expect(await service.getSignatureHelp(fakeEditor('Nope'), [0, 2])).toBeNull();
    });
  });

  describe('datatip', () => {
    let service: ReturnType<typeof createDatatipProvider>;
    beforeEach(() => {
      service = createDatatipProvider(api);
    });

    it('returns a datatip for a known symbol', async () => {
      const tip = await service.datatip(fakeEditor('InitWindow'), [0, 5]);
      expect(tip).toBeTruthy();
      expect(tip!.markedStrings[0].value).toContain('InitWindow');
      expect(tip!.markedStrings.some((m) => m.value.includes('Initialize window'))).toBe(true);
    });

    it('returns null for an unknown symbol', async () => {
      expect(await service.datatip(fakeEditor('Nope'), [0, 2])).toBeNull();
    });
  });
});
