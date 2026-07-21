import { ApiIndex } from './api';

// Structural editor shape — matches both real TextEditors and test fakes.
type WordHit = { getText(): string; range: unknown };
type EditorLike = { getBuffer(): { getWordAt(position: unknown): WordHit | null } };

export type SignatureHelp = {
  signatures: { label: string; documentation: string; parameters: { label: string }[] }[];
  activeSignature: number;
  activeParameter: number;
};

export type SignatureHelpProvider = {
  priority: number;
  grammarScopes: string[];
  triggerCharacters: Set<string>;
  getSignatureHelp(editor: EditorLike, position: unknown): Promise<SignatureHelp | null>;
};

function wordAt(editor: EditorLike, position: unknown): string {
  const word = editor.getBuffer().getWordAt(position);
  return word ? word.getText() : '';
}

// Factory closes over an ApiIndex so it is testable without the host.
export function createSignatureHelpProvider(apiIndex: ApiIndex): SignatureHelpProvider {
  return {
    priority: 1,
    grammarScopes: ['source.c', 'source.cpp'],
    triggerCharacters: new Set(['(', ',']),

    getSignatureHelp(editor, position): Promise<SignatureHelp | null> {
      const sig = apiIndex.signatureFor(wordAt(editor, position));
      if (!sig) return Promise.resolve(null);
      return Promise.resolve({
        signatures: [
          {
            label: sig.label,
            documentation: sig.documentation,
            parameters: sig.params.map((p) => ({ label: p.label }))
          }
        ],
        activeSignature: 0,
        activeParameter: 0
      });
    }
  };
}
