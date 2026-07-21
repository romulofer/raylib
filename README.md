# raylib for Pulsar

raylib 6.0 code completion, snippets, boilerplate, and a run button for C and C++ in the [Pulsar](https://pulsar-edit.dev) editor.

## About

This package brings the [raylib](https://www.raylib.com) 6.0 API into Pulsar for C and C++ projects. It provides autocomplete for raylib functions, structs, enums, and defines, curated snippets, one-command boilerplate insertion, optional signature help and hover docs, and a status bar button that runs your project with a command you configure. Everything except signature help and hover docs works with zero extra setup. The optional services activate only when a compatible consumer package is installed and stay silent otherwise.

## Features

- **Completions** for raylib 6.0 functions (with tab stopped parameter snippets), structs, enums, and `#define` constants in `.c` and `.cpp` files. Function return type shows on the left, `raylib` on the right, and the upstream description inline.
- **Snippets** (prefix, then Tab):
  - `rlloop` main game loop
  - `rlwindow` window scaffold
  - `rldraw` drawing block
  - `rlcam2d` Camera2D setup
  - `rlshader` shader load and unload
- **Boilerplate commands** (command palette or the Packages menu):
  - `raylib:insert-main-loop`
  - `raylib:insert-starter-file-c`
  - `raylib:insert-starter-file-cpp`
- **Signature help and hover docs** (optional): versioned `signature-help` and `datatip` services, active when a consumer package provides them.
- **Run button** (optional): when the open project uses raylib (a source file includes `raylib.h`), a run tile appears in the status bar. Clicking it runs the command from the `raylib.runCommand` setting in the project root. The command palette entry is `raylib:run`.

## Install

From the Pulsar settings view, open Packages, search for `raylib`, and install. Or from the command line:

```bash
ppm install raylib
```

## Configuration

- `raylib.runCommand` (string, default `make && ./game`): shell command the run button uses to build and launch the project. It runs in the project root.

## Development

Requires [Node 22](.nvmrc) and [Bun](https://bun.sh) as the package manager. TypeScript source lives in `src/` and compiles to `lib/`, which Pulsar loads.

```bash
nvm use 22
bun install
bun run build
pulsar --test lib/spec
```

To run a single compiled suite while iterating:

```bash
pulsar --test lib/spec/api-spec.js
```

The vendored `data/raylib_api.json` is a hand authored bootstrap subset. A maintainer regenerates the full file from a pinned upstream raylib release with `script/update-api.js` (humans only).

## License

[MIT](LICENSE) (c) 2026 Rômulo Fernandes Evangelista
