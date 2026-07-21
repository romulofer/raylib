import { ApiIndex, ApiRecord, FunctionRecord } from './api';

const CHEATSHEET_URL = 'https://www.raylib.com/cheatsheet/cheatsheet.html';

export type SuggestionType = 'function' | 'class' | 'constant' | 'value';

export type Suggestion = {
  displayText: string;
  type: SuggestionType;
  rightLabel: string;
  description: string;
  descriptionMoreURL: string;
  text?: string;
  snippet?: string;
  leftLabel?: string;
};

export type AutocompleteProvider = {
  selector: string;
  disableForSelector: string;
  inclusionPriority: number;
  suggestionPriority: number;
  excludeLowerPriority: boolean;
  getSuggestions(request: { prefix?: string }): Suggestion[];
};

const TYPE_BY_KIND: Record<ApiRecord['kind'], SuggestionType> = {
  function: 'function',
  struct: 'class',
  enum: 'constant',
  define: 'constant'
};

// Build "InitWindow(${1:width}, ${2:height}, ${3:title})" from a function record.
function functionSnippet(rec: FunctionRecord): string {
  const parts = rec.params.map((p, i) => `\${${i + 1}:${p.name}}`);
  return `${rec.name}(${parts.join(', ')})`;
}

function suggestionFor(rec: ApiRecord): Suggestion {
  const suggestion: Suggestion = {
    displayText: rec.name,
    type: TYPE_BY_KIND[rec.kind],
    rightLabel: 'raylib',
    description: rec.description,
    descriptionMoreURL: CHEATSHEET_URL
  };
  if (rec.kind === 'function') {
    suggestion.snippet = functionSnippet(rec);
    suggestion.leftLabel = rec.returnType;
  } else {
    suggestion.text = rec.name;
  }
  return suggestion;
}

// Factory: the provider closes over an ApiIndex so it is testable without the host.
export function createProvider(apiIndex: ApiIndex, options: { limit?: number } = {}): AutocompleteProvider {
  const limit = options.limit ?? 50;
  return {
    selector: '.source.c, .source.cpp',
    disableForSelector: '.source.c .comment, .source.cpp .comment',
    inclusionPriority: 1,
    suggestionPriority: 2,
    excludeLowerPriority: false,

    getSuggestions({ prefix }): Suggestion[] {
      const trimmed = (prefix ?? '').trim();
      if (trimmed.length === 0) return [];
      return apiIndex.match(trimmed, limit).map(suggestionFor);
    }
  };
}
