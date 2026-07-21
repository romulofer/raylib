import { TextEditor } from 'atom';

export type StarterVariant = 'c' | 'cpp';

const MAIN_LOOP = `while (!WindowShouldClose()) {
    BeginDrawing();
    ClearBackground(RAYWHITE);
    // Draw here
    EndDrawing();
}
`;

function starterFile(variant: StarterVariant): string {
  const mainSig = variant === 'cpp' ? 'int main()' : 'int main(void)';
  return `#include "raylib.h"

${mainSig}
{
    InitWindow(800, 450, "raylib example");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(RAYWHITE);
        DrawText("Congrats! You created your first window!", 190, 200, 20, RAYWHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}
`;
}

// Insert the standard render loop at the cursor of the active editor.
export function insertMainLoop(editor: TextEditor): void {
  editor.insertText(MAIN_LOOP);
}

// Insert a full runnable starter file. `variant` is 'c' (default) or 'cpp'.
export function insertStarterFile(editor: TextEditor, variant: StarterVariant = 'c'): void {
  editor.insertText(starterFile(variant));
}
