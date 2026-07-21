import * as path from 'path';
import { loadApi } from '../api';
import { createProvider } from '../provider';

const FIXTURE = path.join(__dirname, 'fixtures', 'raylib_api.sample.json');

describe('raylib autocomplete provider', () => {
  let provider: ReturnType<typeof createProvider>;

  beforeEach(() => {
    provider = createProvider(loadApi(FIXTURE));
  });

  it('targets C and C++ scopes', () => {
    expect(provider.selector).toContain('.source.c');
    expect(provider.selector).toContain('.source.cpp');
  });

  it('suggests functions with a tab-stopped snippet', () => {
    const suggestions = provider.getSuggestions({ prefix: 'InitW' });
    const init = suggestions.find((s) => s.displayText === 'InitWindow');
    expect(init).toBeTruthy();
    expect(init!.type).toBe('function');
    expect(init!.snippet).toBe('InitWindow(${1:width}, ${2:height}, ${3:title})');
    expect(init!.leftLabel).toBe('void');
    expect(init!.rightLabel).toBe('raylib');
    expect(init!.description).toBe('Initialize window and OpenGL context');
    expect(typeof init!.descriptionMoreURL).toBe('string');
  });

  it('suggests a no-arg function with an empty call snippet', () => {
    const suggestions = provider.getSuggestions({ prefix: 'InitA' });
    const init = suggestions.find((s) => s.displayText === 'InitAudioDevice');
    expect(init!.snippet).toBe('InitAudioDevice()');
  });

  it('maps structs to class and enums/defines to constant', () => {
    expect(provider.getSuggestions({ prefix: 'Color' })[0].type).toBe('class');
    expect(provider.getSuggestions({ prefix: 'KEY_' })[0].type).toBe('constant');
    expect(provider.getSuggestions({ prefix: 'RAYLIB' })[0].type).toBe('constant');
  });

  it('returns nothing for an empty prefix', () => {
    expect(provider.getSuggestions({ prefix: '' })).toEqual([]);
  });

  it('caps the number of suggestions', () => {
    expect(provider.getSuggestions({ prefix: 'i' }).length).toBeLessThan(51);
  });
});
