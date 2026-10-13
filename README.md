# Ethan (Yisong) Cao’s personal website

A white research portfolio with Lato typography, a portrait under your name, an About me introduction, research stories, Teaching and CV pages, and separate photo albums for Layla and Blake. The homepage includes an Animals section. Profile, Research, Teaching, CV, and Cat sit in one navigation row. Navigation stays pinned while scrolling. Page changes turn the whole viewport right to left like a book in 1.3 seconds, with the destination already underneath. Reduced-motion preferences skip the animation. The background dots are static.

Built with HTML, CSS, and JavaScript modules. No package installation or build step is needed for production; GitHub Pages can serve the files directly.

## Preview

With Node.js 20 or newer, run `npm run dev` and open <http://127.0.0.1:5173>. To change the port: `npm run dev -- --port 8080`.

## Add your content

Edit [`assets/js/content.js`](assets/js/content.js). Your UVA introduction, email addresses, portrait, and cat photos are included. Four research entries, including PARCv2 fluid-dynamics work at the Visual Intelligence Lab, the COMM 4351 guest lecture with Professor Natasha Foutz, SARC 5400 teaching assistance, and Charlottesville Debate League tournament leadership are included. The CV is populated from the supplied resume, with Cisco, Align, Tencent, research roles, education, and skills.

**Portrait:** your photo is at `assets/images/portrait.jpg`. To replace it, update `portrait`, `portraitAlt`, `portraitWidth`, and `portraitHeight` in the content file and the corresponding image in `index.html`.

**Research and internships:** add entries to `research` in display order. Replace the example values below; remove optional fields you do not need. Images are optional; entries without images use a clean text layout. Optional `organization`, `role`, `location`, `dates`, and `highlights` fields support research appointments and their contributions.

```js
research: [
  {
    title: "Your project title",
    summary: "The question, your contribution, and the main finding.",
    year: "2026",
    image: "./assets/images/project-figure.png", // Optional; add file first.
    imageAlt: "Describe what the figure shows.",
    details: ["What motivated the work?", "What did you learn or contribute?"],
    links: [
      { label: "Paper", url: "https://your-paper-url" },
      { label: "Code", url: "https://your-repository-url" },
    ],
  },
],
```

**Teaching:** add entries to `teaching`. The homepage shows the first three as photo cards with closer crops; Teaching shows all entries, descriptions, and links. `term` is optional until you have a date. Guest lectures can include `materials: [{ title, summary, url }]` for downloadable notebooks. Add `photo: { src, alt, width, height, position }` for a teaching or community photo.

```js
teaching: [
  {
    code: "Course code",
    title: "Course name",
    institution: "University of Virginia",
    role: "Teaching Assistant",
    term: "Fall 2026",
    description: "Your responsibilities and what you helped students learn.",
    links: [],
  },
],
```

**CV:** the resume is at `assets/PDFs/Ethan Cao Resume.pdf`. Update `cv.url` when replacing it. Edit `cv.experiences` to maintain the connected timeline: entries take `id`, `organization`, `role`, `category`, optional `dates`, `location`, `summary`, `highlights`, `links`, and `photo: { src, alt, width, height, wide }`. Education, coursework, and skill groups are also editable in `cv`. Tencent IEG is listed as a Data Analyst Internship in Shenzhen, May–August 2024, with the supplied gaming-market analysis contributions. Filters work with the categories in the data. Resume viewing and download links are always available; the embedded preview loads only when opened.

**Animals section:** update `animals` in the content file to change the homepage previews. Each entry takes `title`, `src`, `width`, `height`, `alt`, and a destination `url`. Add entries for other animals as your collection grows. The introductory previews are also in `index.html` for visitors without JavaScript.

**Cat photos:** add files to `assets/images/cats/` and append to `cat.photos`:

```js
{
  id: "a-unique-photo-name",
  src: "./assets/images/cats/new-photo.jpg",
  width: 1200,
  height: 1600,
  alt: "Describe what Layla is doing.",
  title: "A short caption",
  category: "Layla",
},
```

Use displayed pixel dimensions, accounting for camera rotation. Captions display titles only. Categories become filters automatically when there is more than one category. Arrow keys browse the photo viewer; Escape closes it. Update `cat.hero`, `cat.heroAlt`, `cat.bio`, and `cat.loves` to change the introduction.

The homepage also contains a static biography for search engines and visitors without JavaScript. If you change your introduction, update the matching text and contact links in `index.html`. Page titles and descriptions live in the HTML files.

## Files

- `index.html`, `teaching.html`, `cv.html`, `cat.html`, `blake.html`: public pages.
- `assets/css/style.css`: layout, colors, fonts, motion, and mobile styles.
- `assets/js/content.js`: editable content.
- `assets/js/app.js`: rendering, animal previews, and gallery behavior.
- `assets/js/cv.js`: CV timeline, category filters, education, skills, and lazy PDF preview.
- `assets/js/page-turn.js`: a curved paper fold over live DOM, with a grain texture, soft shadows, and a hand following the paper edge.
- `assets/js/transition.js`: cached page navigation and browser history. Navigation remains native without JavaScript; slow or failed fetches fall back to normal links instead of extending the animation.
- `assets/PDFs/`, `assets/PowerPoints/`: the semantic-shifts draft and current 3D research summary.
- `assets/Python_notebook/`: downloadable COMM 4351 lecture notebooks. Saved execution logs are cleared; original notebook copies are backed up under `/tmp/ethan-lecture-notebook-originals`.
- `assets/images/experience/`: Cisco, Align, Tencent, COMM 4351, SARC 5400, and CDL photos. CDL appears only in Teaching.
- `assets/images/cats/`: Layla’s photos and six Blake photos with descriptive filenames.
- `assets/fonts/`: local Lato Regular/Bold WOFF2 web fonts and their Open Font License. Original TTF files are backed up at `/tmp/ethan-site-original-fonts`.
- `docs/design/baseline.png`: accepted design reference.
- `docs/design/tornado-transition.png`: archived design exploration; the current transition is a book page turn.
- `scripts/`, `tests/browser/`: preview and verification.

Old generated design drafts were moved to `/tmp/ethan-site-design-drafts-20261012`. The previous survey and remote GIF embeds were removed from the public page.

## Verify

Check content, local references, and JavaScript syntax with `npm run check`; no dependency installation is needed.

For browser checks:

```sh
npm ci
PLAYWRIGHT_BROWSERS_PATH=/tmp/ethan-site-browsers npx playwright install chromium
npm run test:browser
```

Tests cover mobile and desktop layouts, navigation, keyboard photo controls and focus restoration, motion preferences, populated content, and automated accessibility checks. Test-only sample content stays in the tests.

## GitHub Pages

Select **Deploy from a branch**, your published branch, and **/(root)** in GitHub Pages settings. `.nojekyll` preserves the static files. Internal paths are relative, so the site also works below a project URL. No compilation is required.

Blake’s album lives at `blake.html` and uses `site.blake` in the content file. Layla uses `site.cat`. The Cat pages link to both albums, each with its own lightbox.

Research `labs` entries are linked names displayed below each project title. The favicon embeds the supplied `layla-head.jpg` in a square SVG viewport.

The hand uses ten photorealistic gesture frames in `assets/images/motion/page-turn-grip-10.png` (five columns × two rows), generated with the built-in imagegen tool. The thumb rests above four supporting fingers. Adjacent poses blend through approach, grip, turn, release, and withdrawal; wrist movement follows the paper until release. The prompt is in `docs/design/page-turn-grip-10-prompt.txt`.
