import * as path from 'path';
import { CompositeDisposable, Disposable } from 'atom';
import { ApiIndex, loadApi } from './api';
import { AutocompleteProvider, createProvider } from './provider';
import { insertMainLoop, insertStarterFile } from './commands';
import { createSignatureHelpProvider, SignatureHelpProvider } from './signature-help';
import { createDatatipProvider, DatatipProvider } from './datatip';
import { isRaylibProject } from './detect';
import { runProject } from './runner';
import { createRunTile, RunTile } from './status-bar-tile';

const DATA_PATH = path.join(__dirname, '..', 'data', 'raylib_api.json');

type CommandEvent = { currentTarget: { getModel(): any } };

class RaylibPackage {
  config = {
    runCommand: {
      type: 'string',
      default: 'make && ./game',
      description:
        'Shell command used by the raylib run button to build and launch the project. Runs in the project root.'
    }
  };

  private subscriptions: CompositeDisposable | null = null;
  private apiIndex: ApiIndex | null = null;
  private provider: AutocompleteProvider | null = null;
  private runTile: RunTile | null = null;

  activate(): void {
    this.subscriptions = new CompositeDisposable();

    // Fail soft: if the API data is missing/corrupt, notify and register no
    // data-driven features, but keep the editor usable.
    try {
      this.apiIndex = loadApi(DATA_PATH);
      this.provider = createProvider(this.apiIndex);
    } catch (error) {
      (atom as any).notifications.addError('raylib: failed to load API data', {
        detail: String((error as Error).message),
        dismissable: true
      });
      this.apiIndex = null;
      this.provider = null;
    }

    // Commands do not need the API index, so they register unconditionally.
    this.subscriptions.add(
      (atom as any).commands.add('atom-text-editor', {
        'raylib:insert-main-loop': (event: CommandEvent) =>
          insertMainLoop(event.currentTarget.getModel()),
        'raylib:insert-starter-file-c': (event: CommandEvent) =>
          insertStarterFile(event.currentTarget.getModel(), 'c'),
        'raylib:insert-starter-file-cpp': (event: CommandEvent) =>
          insertStarterFile(event.currentTarget.getModel(), 'cpp'),
        'raylib:run': () => this.runCurrentProject()
      })
    );
  }

  deactivate(): void {
    if (this.subscriptions) this.subscriptions.dispose();
    this.subscriptions = null;
    this.apiIndex = null;
    this.provider = null;
  }

  // providedServices hook. Returns the autocomplete-plus provider (or a no-op
  // provider if the API data failed to load, so the host never sees undefined).
  provideAutocomplete(): AutocompleteProvider {
    if (this.provider) return this.provider;
    return {
      selector: '.source.c, .source.cpp',
      disableForSelector: '',
      inclusionPriority: 1,
      suggestionPriority: 2,
      excludeLowerPriority: false,
      getSuggestions: () => []
    };
  }

  // Phase 2 services. Only reachable when a consumer package is installed;
  // if the API data failed to load, return undefined so nothing registers.
  provideSignatureHelp(): SignatureHelpProvider | undefined {
    return this.apiIndex ? createSignatureHelpProvider(this.apiIndex) : undefined;
  }

  provideDatatip(): DatatipProvider | undefined {
    return this.apiIndex ? createDatatipProvider(this.apiIndex) : undefined;
  }

  // consumedServices hook. Only adds a button when the open project uses raylib;
  // if no status-bar consumer/host service is present this is simply never called.
  consumeStatusBar(statusBar: {
    addRightTile(opts: { item: HTMLElement; priority: number }): { destroy(): void };
  }): void {
    const root = (atom as any).project.getPaths()[0] as string | undefined;
    if (!root || !isRaylibProject(root)) return;

    this.runTile = createRunTile(() => this.runCurrentProject());
    const tile = statusBar.addRightTile({ item: this.runTile.element, priority: 100 });

    this.subscriptions?.add(
      new Disposable(() => {
        tile.destroy();
        this.runTile?.destroy();
        this.runTile = null;
      })
    );
  }

  // Run the user-configured command in the project root, surfacing progress and
  // the result through notifications.
  runCurrentProject(): void {
    const root = (atom as any).project.getPaths()[0] as string | undefined;
    if (!root) {
      (atom as any).notifications.addWarning('raylib: no project folder open');
      return;
    }
    const command = (atom as any).config.get('raylib.runCommand') as string;
    let output = '';
    try {
      runProject(command, root, {
        onOutput: (data) => { output += data; },
        onExit: (code) => {
          if (code === 0) {
            (atom as any).notifications.addSuccess('raylib: run finished');
          } else {
            (atom as any).notifications.addError(`raylib: run exited with code ${code}`, {
              detail: output.slice(-2000),
              dismissable: true
            });
          }
        }
      });
      (atom as any).notifications.addInfo(`raylib: running \`${command}\``);
    } catch (error) {
      (atom as any).notifications.addError('raylib: could not start run', {
        detail: String((error as Error).message)
      });
    }
  }
}

module.exports = new RaylibPackage();
