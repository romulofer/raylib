// Ambient globals for the Jasmine spec runner and the Pulsar `atom` environment.
// Declared locally to avoid adding @types/jasmine as a dependency (the specs
// are TypeScript, so tsc needs these names to compile). `atom` is loosely typed
// because the specs interact with it via `(atom as any)` casts.

declare function describe(description: string, spec: () => void): void;
declare function fdescribe(description: string, spec: () => void): void;
declare function xdescribe(description: string, spec: () => void): void;
declare function it(expectation: string, assertion?: () => void | Promise<void>): void;
declare function fit(expectation: string, assertion?: () => void | Promise<void>): void;
declare function xit(expectation: string, assertion?: () => void | Promise<void>): void;
declare function beforeEach(action: () => void | Promise<void>): void;
declare function afterEach(action: () => void | Promise<void>): void;
declare function beforeAll(action: () => void | Promise<void>): void;
declare function afterAll(action: () => void | Promise<void>): void;
declare function expect(actual: unknown): any;

declare const atom: any;
