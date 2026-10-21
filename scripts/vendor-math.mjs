import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

const source = new URL('../node_modules/katex/', import.meta.url);
const target = new URL('../assets/vendor/katex/', import.meta.url);
await mkdir(new URL('fonts/', target), { recursive: true });

// Serve the renderer and fonts from the site, with no third-party requests
await copyFile(new URL('dist/katex.min.js', source), new URL('katex.min.js', target));
// Modern browsers use WOFF2, so omit the duplicate legacy font formats
const css = await readFile(new URL('dist/katex.min.css', source), 'utf8');
await writeFile(new URL('katex.min.css', target), css.replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\) format\("[^"]+"\)/g, ''));
await copyFile(new URL('LICENSE', source), new URL('LICENSE', target));
for (const font of await readdir(new URL('dist/fonts/', source))) {
  if (font.endsWith('.woff2')) await copyFile(new URL(`dist/fonts/${font}`, source), new URL(`fonts/${font}`, target));
}
const { version } = JSON.parse(await readFile(new URL('package.json', source), 'utf8'));
await writeFile(new URL('VERSION', target), `${version}\n`);
console.log(`Copied KaTeX ${version} and its fonts`);
