import * as fs from 'fs';

export type Param = { type: string; name: string };

export type FunctionRecord = {
  kind: 'function';
  name: string;
  description: string;
  returnType: string;
  params: Param[];
};

export type StructField = { type: string; name: string; description: string };

export type StructRecord = {
  kind: 'struct';
  name: string;
  description: string;
  fields: StructField[];
};

export type EnumRecord = {
  kind: 'enum';
  name: string;
  description: string;
  enumName: string;
  value: number | string;
};

export type DefineRecord = {
  kind: 'define';
  name: string;
  description: string;
  type: string;
  value: number | string;
};

export type ApiRecord = FunctionRecord | StructRecord | EnumRecord | DefineRecord;

export type Signature = {
  label: string;
  params: { label: string }[];
  documentation: string;
};

// Build a normalized parameter label like "const char * title".
function paramLabel(param: Param): string {
  return `${param.type} ${param.name}`.replace(/\s+/g, ' ').trim();
}

export class ApiIndex {
  readonly records: ApiRecord[];
  private readonly byName: Map<string, ApiRecord>;

  constructor(records: ApiRecord[]) {
    this.records = records;
    this.byName = new Map();
    for (const rec of records) {
      // First writer wins; the four raylib groups do not collide on names.
      if (!this.byName.has(rec.name)) this.byName.set(rec.name, rec);
    }
  }

  lookup(name: string): ApiRecord | undefined {
    return this.byName.get(name);
  }

  // Prefix hits first (alphabetical), then mid-string hits (alphabetical), capped.
  match(prefix: string, limit = 50): ApiRecord[] {
    const needle = (prefix || '').toLowerCase();
    const prefixHits: ApiRecord[] = [];
    const substringHits: ApiRecord[] = [];
    for (const rec of this.records) {
      const lower = rec.name.toLowerCase();
      if (needle === '' || lower.startsWith(needle)) prefixHits.push(rec);
      else if (lower.includes(needle)) substringHits.push(rec);
    }
    const byName = (a: ApiRecord, b: ApiRecord): number => a.name.localeCompare(b.name);
    prefixHits.sort(byName);
    substringHits.sort(byName);
    return prefixHits.concat(substringHits).slice(0, limit);
  }

  signatureFor(name: string): Signature | undefined {
    const rec = this.byName.get(name);
    if (!rec || rec.kind !== 'function') return undefined;
    const params = rec.params.map((p) => ({ label: paramLabel(p) }));
    const label = `${rec.returnType} ${rec.name}(${params.map((p) => p.label).join(', ')})`;
    return { label, params, documentation: rec.description };
  }
}

// Load + index the raylib API JSON. Throws on missing/corrupt input; the caller
// (main.ts) is responsible for failing soft. `data` is untyped upstream JSON.
export function loadApi(filePath: string): ApiIndex {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as {
    functions?: any[];
    structs?: any[];
    enums?: any[];
    defines?: any[];
  };
  const records: ApiRecord[] = [];

  for (const fn of data.functions ?? []) {
    records.push({
      kind: 'function',
      name: fn.name,
      description: fn.description ?? '',
      returnType: fn.returnType ?? 'void',
      params: (fn.params ?? []).map((p: any) => ({ type: p.type, name: p.name }))
    });
  }
  for (const s of data.structs ?? []) {
    records.push({
      kind: 'struct',
      name: s.name,
      description: s.description ?? '',
      fields: (s.fields ?? []).map((f: any) => ({
        type: f.type,
        name: f.name,
        description: f.description ?? ''
      }))
    });
  }
  for (const e of data.enums ?? []) {
    for (const v of e.values ?? []) {
      records.push({
        kind: 'enum',
        name: v.name,
        description: v.description ?? '',
        enumName: e.name,
        value: v.value
      });
    }
  }
  for (const d of data.defines ?? []) {
    records.push({
      kind: 'define',
      name: d.name,
      description: d.description ?? '',
      type: d.type,
      value: d.value
    });
  }

  return new ApiIndex(records);
}
