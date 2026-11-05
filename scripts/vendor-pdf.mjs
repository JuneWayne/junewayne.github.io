import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const source = new URL('../node_modules/pdfjs-dist/', import.meta.url);
const target = new URL('../assets/vendor/pdfjs/', import.meta.url);
await mkdir(target, { recursive: true });
// Keep the document reader and its fonts local to the website.
for (const file of ['build/pdf.min.mjs', 'build/pdf.worker.min.mjs', 'web/pdf_viewer.mjs', 'web/pdf_viewer.css', 'LICENSE']) {
  await copyFile(new URL(file, source), new URL(file.split('/').at(-1), target));
}
for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  await cp(new URL(directory, source), new URL(directory, target), { recursive: true });
}
await cp(new URL('web/images/', source), new URL('images/', target), { recursive: true });
const { version } = JSON.parse(await readFile(new URL('package.json', source), 'utf8'));
await writeFile(new URL('VERSION', target), `${version}\n`);
console.log(`Copied PDF.js ${version} and its document resources`);
