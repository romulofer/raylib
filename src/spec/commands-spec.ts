import { insertMainLoop, insertStarterFile } from '../commands';

describe('raylib boilerplate commands', () => {
  let editor: any;

  beforeEach(async () => {
    editor = await (atom as any).workspace.open();
  });

  it('inserts the main game loop at the cursor', () => {
    insertMainLoop(editor);
    const text = editor.getText();
    expect(text).toContain('while (!WindowShouldClose())');
    expect(text).toContain('BeginDrawing();');
    expect(text).toContain('EndDrawing();');
  });

  it('inserts a full C starter file', () => {
    insertStarterFile(editor, 'c');
    const text = editor.getText();
    expect(text).toContain('#include "raylib.h"');
    expect(text).toContain('int main(void)');
    expect(text).toContain('InitWindow(800, 450,');
    expect(text).toContain('CloseWindow();');
    expect(text).not.toContain('#include <raylib.h>');
  });

  it('inserts a C++ starter file when asked', () => {
    insertStarterFile(editor, 'cpp');
    const text = editor.getText();
    expect(text).toContain('int main()');
    expect(text).toContain('InitWindow(800, 450,');
  });
});
