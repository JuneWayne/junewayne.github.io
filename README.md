# Ethan (Yisong) Cao’s personal website

A white research portfolio with Lato typography, a portrait under your name, an About me introduction, research stories, Teaching and CV pages, and separate photo albums for Layla and Blake. The homepage includes an Animals section. Profile, Research, Teaching, CV, and Cat sit in one navigation row. Navigation stays pinned while scrolling. Page changes are immediate, with no transition animations. The former book-page animation is preserved in `docs/archive/page-turn/` and is not loaded by the site. The background dots are static.

Built with HTML, CSS, and JavaScript modules. No package installation or build step is needed for production; GitHub Pages can serve the files directly.

## Preview

With Node.js 20 or newer, run `npm run dev` and open <http://127.0.0.1:5173>. To change the port: `npm run dev -- --port 8080`.

## Add your content

Edit [`assets/js/content.js`](assets/js/content.js). Your UVA introduction, email addresses, portrait, and cat photos are included. Four research entries, including PARCv2 fluid-dynamics work at the Visual Intelligence Lab, the COMM 4351 guest lecture with Professor Natasha Foutz, SARC 5400 teaching assistance, and Charlottesville Debate League tournament leadership are included. The CV is populated from the supplied resume, with Cisco, Align, Tencent, research roles, education, and skills.

**Portrait:** your photo is at `assets/images/portrait.jpg`. To replace it, update `portrait`, `portraitAlt`, `portraitWidth`, and `portraitHeight` in the content file and the corresponding image in `index.html`.

**Research and internships:** projects appear on the homepage and on the independent `research.html` page. Add entries to `research` in display order. Replace the example values below; remove optional fields you do not need. Images are optional; entries without images use a clean text layout. Optional `organization`, `role`, `location`, `dates`, and `highlights` fields support research appointments and their contributions.

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

**CV:** the resume is at `assets/PDFs/Ethan Cao Resume.pdf`. Update `cv.url` when replacing it. Edit `cv.experiences` to maintain the connected timeline: entries take `id`, `organization`, `role`, `category`, optional `dates`, `summary`, `highlights`, `links`, and `photo: { src, alt, width, height, wide }`. Education, coursework, and skill groups are also editable in `cv`. Tencent IEG is listed as a Data Analyst Internship in Shenzhen, May–August 2024, with the supplied gaming-market analysis contributions. Filters show Industry by default, with Research and Teaching alongside it. Teaching includes COMM 4351, SARC 5400 (January–April 2024), MSBA grading for Professor Mousavi (GBAC 7209 and GBAC 7215, January–April 2025), and Charlottesville Debate League. Resume viewing and download links are always available; the embedded preview loads only when opened.

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

- `index.html`, `research.html`, `teaching.html`, `cv.html`, `cat.html`, `blake.html`: public pages.
- `assets/css/style.css`: layout, colors, fonts, motion, and mobile styles.
- `assets/js/content.js`: editable content.
- `assets/js/app.js`: rendering, animal previews, and gallery behavior.
- `assets/js/cv.js`: CV timeline, category filters, education, skills, and lazy PDF preview.
- `docs/archive/page-turn/`: archived page-turn code, hand artwork, CSS, and animation tests, with restoration instructions.
- `assets/js/transition.js`: cached page navigation and browser history. Navigation remains native without JavaScript; slow or failed fetches fall back to normal links if a page cannot be fetched promptly.
- `assets/PDFs/`, `assets/PowerPoints/`: the semantic-shifts draft and current 3D research summary.
- `assets/Python_notebook/`: downloadable COMM 4351 lecture notebooks. Saved execution logs are cleared; original notebook copies are backed up under `/tmp/ethan-lecture-notebook-originals`.
- `assets/images/experience/`: Cisco, Align, Tencent, COMM 4351, SARC 5400, and CDL photos.
- `assets/images/cats/`: Layla’s photos and six Blake photos with descriptive filenames.
- `assets/fonts/`: local Lato Regular/Bold WOFF2 web fonts and their Open Font License. Original TTF files are backed up at `/tmp/ethan-site-original-fonts`.
- `docs/design/baseline.png`: accepted design reference.
- `docs/design/tornado-transition.png`: archived design exploration; page transitions are currently disabled.
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

The archived left hand uses ten photorealistic gesture frames in `docs/archive/page-turn/assets/images/motion/page-turn-left-hand-10.png` (five columns × two rows), generated with the built-in imagegen tool. The thumb rests above four supporting fingers. Adjacent poses blend through approach, grip, turn, release, and withdrawal; wrist movement follows the paper until release. The prompt is in `docs/design/page-turn-left-hand-10-prompt.txt`.

During the grip, the full hand is behind the curved paper and a separate per-frame thumb mask is above it. The sheet occludes the supporting fingers and palm. The hand returns above the page only when the grip opens during release.

The left-hand sequence is drawn in its final orientation and is not mirrored at runtime. The paper is procedural SVG geometry, with a continuously calculated fold and lighting rather than ten separately drawn sheets.

The initial reach takes about 90 ms. The hand follows the page edge continuously past the left viewport boundary; there is no boundary clamp or downward withdrawal.

Coursework is grouped in `cv.coursework` as `{ title, courses: [{ code, title, description?, status? }] }`. Fall 2026 enrollment status remains in the data but is not displayed; repeated courses appear once. Test credits and the zero-credit international-study record are excluded. The transcript is a local reference, not a published download. Descriptions are concise summaries, informed by the transcript, the owner’s CS 3501 clarification, and [UVA course listings](https://hooslist.virginia.edu/CourseCatalog/Group/DataScience), the [DS 4021 syllabus](https://github.com/UVADS/DS-4021), and [CS teaching descriptions](https://www.cs.virginia.edu/~nn4pj/teaching).

CV cards use their first non-download resource as a native title link stretched across the card. Additional resource links, photos, and contribution controls stay independently clickable.

The PARC PowerPoint download is `assets/PowerPoints/ShearFlow-PARC-web.pptx`, a 93.7 MB web copy of the supplied 294.6 MB `ShearFlow Presentation.pptx`. All 83 slides and all non-GIF entries are unchanged. Its 135 GIFs retain their dimensions, animation duration, and continuous playback, with temporally subsampled frames (every fourth frame plus the final frame) and palette optimization to fit GitHub's per-file limit. The original remains local and is not committed.

The card's `parc-shearflow-tracer.gif` is extracted from `ppt/media/image68.gif` on slide 40: RK4 snapshot tracer predictions against ground truth on a test sample. It retains all 20 original frames without re-encoding; a GIF loop extension enables continuous playback on the website. The PNG fallback is frame 11 and serves reduced-motion visitors; the GIF loops continuously and can be opened at full size. Reported training-time and MSE figures come from slide 52, with the MSE improvement explicitly scoped to a training sample.

`parc-slides.html` provides an independent, self-hosted viewer for all 83 slides. The research card opens this viewer, with a separate PowerPoint download. It loads only the current slide's background and GIFs, supports arrow keys, first/last slides, a slide selector, hash links, browser history, and full screen where supported. Reduced-motion visitors see the rendered first frames. Slide text is available beneath the viewer.

To regenerate its assets, render `ShearFlow-PARC-web.pptx` to PDF with LibreOffice Impress, then run `python scripts/export-parc-slides.py path/to/deck.pptx path/to/rendered.pdf` with `python-pptx`, `PyMuPDF`, and `Pillow` installed. The export creates `assets/slides/parc/slides.json`, 83 WebP backgrounds, and the 134 unique GIFs used by its slides, extracted unchanged from the web deck. Animation placement includes each original picture's crop rectangle. Backgrounds use locally available font substitutes where the original PowerPoint fonts are unavailable; the downloadable PPTX retains its original font definitions. Native PowerPoint transition effects are not reproduced.

`mesh-slides.html` uses the same viewer for all 15 slides of `Collaboration Request.pptx`. Both the homepage and Research card open it directly; the PDF and PowerPoint remain separate resources. Its mesh-generation GIF on slide 2 retains all 122 original frames, timing, and looping. Regenerate with `python scripts/export-parc-slides.py "assets/PowerPoints/Collaboration Request.pptx" "assets/PowerPoints/Collaboration Request.pdf" --slug mesh-transformers --title "Interpretation of 3D Autoregressive Transformers"`. Each viewer declares its own asset directory through `data-slides-base`.

Both presentation viewers use previous/next controls along the slide edges. Their arrows appear when the corresponding edge is hovered or the control receives keyboard focus, and stay visible on touch devices. The top toolbar retains the slide dropdown, counter, and full-screen control. Controls persist across slide changes so keyboard focus is preserved; unavailable directions are disabled.

Navigation follows Profile → Research → CV → Teaching → Cat on every page. Industry CV headings include locally hosted Cisco, Align Technology, and Tencent logos; their original sources are recorded in `assets/images/logos/SOURCES.md`. The adjacent company text provides the accessible name, so the decorative logos have empty alt text.
