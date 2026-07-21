import { ApiIndex, ApiRecord } from './api';

type WordHit = { getText(): string; range: unknown };
type EditorLike = {
  getBuffer(): { getWordAt(position: unknown): WordHit | null };
  getGrammar?(): unknown;
};

export type MarkedString = { type: 'snippet' | 'markdown'; value: string; grammar?: unknown };
export type Datatip = { range: unknown; markedStrings: MarkedString[] };

export type DatatipProvider = {
  priority: number;
  grammarScopes: string[];
  providerName: string;
  datatip(editor: EditorLike, position: unknown): Promise<Datatip | null>;
};

// Build the hover title line for any record kind.
function titleFor(rec: ApiRecord, apiIndex: ApiIndex): string {
  if (rec.kind === 'function') return apiIndex.signatureFor(rec.name)!.label;
  if (rec.kind === 'struct') return `struct ${rec.name}`;
  if (rec.kind === 'enum') return `${rec.enumName}::${rec.name} = ${rec.value}`;
  return `#define ${rec.name} ${rec.value}`;
}

export function createDatatipProvider(apiIndex: ApiIndex): DatatipProvider {
  return {
    priority: 1,
    grammarScopes: ['source.c', 'source.cpp'],
    providerName: 'raylib-datatip',

    datatip(editor, position): Promise<Datatip | null> {
      const word = editor.getBuffer().getWordAt(position);
      if (!word) return Promise.resolve(null);
      const rec = apiIndex.lookup(word.getText());
      if (!rec) return Promise.resolve(null);

      const markedStrings: MarkedString[] = [
        {
          type: 'snippet',
          value: titleFor(rec, apiIndex),
          grammar: editor.getGrammar ? editor.getGrammar() : undefined
        }
      ];
      if (rec.description) markedStrings.push({ type: 'markdown', value: rec.description });
      return Promise.resolve({ range: word.range, markedStrings });
    }
  };
}
