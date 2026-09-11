import ts from 'typescript';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir(new URL('../api/shared/', import.meta.url), { recursive: true });
const source = await readFile(
  new URL('../lib/game.ts', import.meta.url),
  'utf8',
);
const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
});
await writeFile(
  new URL('../api/shared/game.js', import.meta.url),
  output.outputText,
);
