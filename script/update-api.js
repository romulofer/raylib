#!/usr/bin/env node
/*
 * Regenerate data/raylib_api.json from a pinned upstream raylib release.
 *
 * HUMANS ONLY. Per AGENTS.md, automated agents must not run this script,
 * fetch from remotes, or commit its output. Run it yourself when bumping the
 * pinned raylib version, then review the diff.
 *
 * Usage:
 *   node script/update-api.js <path-to-raylib_api.json>
 */
const fs = require('fs');
const path = require('path');

const PINNED_TAG = '6.0';
const OUT_PATH = path.join(__dirname, '..', 'data', 'raylib_api.json');

function main(argv) {
  const input = argv[2];
  if (!input) {
    console.error(`Usage: node script/update-api.js <raylib_api.json>  (pinned raylib ${PINNED_TAG})`);
    process.exit(1);
    return;
  }

  const upstream = JSON.parse(fs.readFileSync(input, 'utf8'));
  const out = {
    functions: (upstream.functions || []).map((fn) => ({
      name: fn.name,
      description: fn.description,
      returnType: fn.returnType,
      params: (fn.params || []).map((p) => ({ type: p.type, name: p.name }))
    })),
    structs: (upstream.structs || []).map((s) => ({
      name: s.name,
      description: s.description,
      fields: (s.fields || []).map((f) => ({ type: f.type, name: f.name, description: f.description }))
    })),
    enums: (upstream.enums || []).map((e) => ({
      name: e.name,
      description: e.description,
      values: (e.values || []).map((v) => ({ name: v.name, value: v.value, description: v.description }))
    })),
    defines: (upstream.defines || []).map((d) => ({
      name: d.name,
      type: d.type,
      value: d.value,
      description: d.description
    }))
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${OUT_PATH} (raylib ${PINNED_TAG}): `
    + `${out.functions.length} functions, ${out.structs.length} structs, `
    + `${out.enums.length} enums, ${out.defines.length} defines.`);
}

main(process.argv);
