# AGENTS.md

Guidance for AI agents working on **pulsar-raylib**, a Pulsar package that adds raylib code completion and writing automations to the Pulsar editor (the community fork of Atom).

Human contributors: see the project spec in `docs/superpowers/specs/`. This file adds rules specific to automated agents. Rules here are mandatory.

## What this project is

A bundled-style Pulsar package. It registers an [autocomplete-plus] provider that surfaces raylib API completions, plus editor automations (snippets, command scaffolds) for writing raylib code. Pulsar is an Electron app; packages are JavaScript with a `package.json` manifest, `lib/` (main entry), `spec/` (tests), `styles/`, `keymaps/`, `menus/`, `snippets/`.

The host editor source lives at `../../pulsar`. Read `../../pulsar/AGENTS.md` for host conventions and `packages/autocomplete-plus` for the provider service contract.

## Repository layout

- `lib/`, package source; `main.js` is the entry (`activate`/`deactivate`, service registration).
- `spec/`, Jasmine test suites, run via the Pulsar test runner.
- `snippets/`, raylib snippet definitions.
- `keymaps/`, `menus/`, `styles/`, package resources.
- `data/`, raylib API definitions used to build completions.
- `docs/`, specs and design docs.

## Toolchain

- **Node.js**: match the host, pinned to `20.16.0` (see `../../pulsar/.nvmrc`).
- **Package manager**: `bun`. `npm` and `yarn` are not supported. Use `bun install` and `bun run <script>`.
- **Runtime**: Electron `30.5.1` (host-provided).
- Install and test the package inside a Pulsar dev session (`ppm link` / `--dev`), not standalone.

## Testing

- Tests run through the Pulsar test runner: `pulsar --test spec` (needs a display; use `xvfb-run` headless).
- Add or update specs for any behavior change and run the relevant suite before claiming a change works.

## Linting / style

- Match host ESLint conventions (`../../pulsar/.eslintrc.js`): no space before named function parens; space before anonymous/arrow parens; prefix unused vars with `_`; `atom` is a global.
- Match the existing conventions of the file you edit. Do not reformat unrelated code.
- **No em dashes.** Do not use em dashes (`—`) in any authored content: prose, code comments, documentation, README, or commit messages. Use a comma, colon, parentheses, or separate sentences instead.

## Agent rules

**These rules are mandatory for AI agents.**

1. **Do not author commits.** Agents must not run `git commit`. Leave changes in the working tree for a human to review and commit.
2. **Do not co-author commits.** Agents must never add a `Co-Authored-By` trailer, `Signed-off-by`, or any other attribution crediting an AI/agent on a commit. Commits are authored solely by the human. Do not add AI attribution to commit messages, PR descriptions, or tags.
3. **Do not push upstream.** Agents must not run `git push`, and must not push to any remote or branch. No `gh pr create`, no branch publishing, no release/tag pushes.
4. **No destructive git.** No `git reset --hard`, `git rebase`, `git clean -f`, force-pushes, or history rewrites unless a human explicitly asks in the same session.
5. **Human owns integration.** Propose diffs and explain them; a human decides what lands. Surface uncertainty instead of guessing.
6. **Stay in scope.** Change only what the task requires. Do not touch `bun.lock`, dependency versions, or the host `../../pulsar` tree unless asked.
7. **Do not edit the host editor.** This package integrates with Pulsar through public services and APIs only. Do not modify files under `../../pulsar`.
8. **Verify before claiming done.** Run the relevant tests/lint and report the actual output. If a step was skipped or failed, say so.
9. **Respect security and licensing.** Do not add dependencies or code that change the license posture. Report anything sensitive rather than acting on it.

## References

- `../../pulsar/AGENTS.md`, host editor agent rules.
- `../../pulsar/packages/autocomplete-plus`, the completion provider service contract.
- `../../pulsar/CONTRIBUTING.md`, host contributor guide.

[autocomplete-plus]: ../../pulsar/packages/autocomplete-plus
