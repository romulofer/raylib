describe('raylib package lifecycle', () => {
  afterEach(async () => {
    if ((atom as any).packages.isPackageActive('raylib')) {
      await (atom as any).packages.deactivatePackage('raylib');
    }
  });

  it('activates without throwing and registers commands', async () => {
    await (atom as any).packages.activatePackage('raylib');
    const editor = await (atom as any).workspace.open();
    const names = (atom as any).commands
      .findCommands({ target: (atom as any).views.getView(editor) })
      .map((c: { name: string }) => c.name);
    expect(names).toContain('raylib:insert-main-loop');
    expect(names).toContain('raylib:insert-starter-file-c');
    expect(names).toContain('raylib:insert-starter-file-cpp');
    expect(names).toContain('raylib:run');
  });

  it('exposes an autocomplete provider via the provided service', async () => {
    const pkg = await (atom as any).packages.activatePackage('raylib');
    const provide = pkg.mainModule.provideAutocomplete();
    expect(provide.selector).toContain('.source.c');
    expect(typeof provide.getSuggestions).toBe('function');
  });

  it('deactivates cleanly (no leaked commands)', async () => {
    await (atom as any).packages.activatePackage('raylib');
    await (atom as any).packages.deactivatePackage('raylib');
    const editor = await (atom as any).workspace.open();
    const names = (atom as any).commands
      .findCommands({ target: (atom as any).views.getView(editor) })
      .map((c: { name: string }) => c.name);
    expect(names).not.toContain('raylib:insert-main-loop');
  });
});
