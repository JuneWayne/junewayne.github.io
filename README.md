# Ethan (Yisong) Cao’s personal website

A white research portfolio with Lato typography, a portrait under your name, an About me introduction, research stories, Teaching and CV pages, and Layla’s photo album. The homepage includes an Animals section. Profile, Research, Teaching, CV, and Cat sit in one navigation row. Page changes use a subtle 900 ms water wave and fade from left to right. Open `?transition=spiral` to compare a smoother 1.1-second spiral. Reduced-motion preferences skip both animations. The background dots are static.

Built with HTML, CSS, and JavaScript modules. No production dependencies or build step; GitHub Pages can serve the files directly.

## Preview

With Node.js 20 or newer, run `npm run dev` and open <http://127.0.0.1:5173>. To change the port: `npm run dev -- --port 8080`.

## Add your content

Edit [`assets/js/content.js`](assets/js/content.js). Your UVA introduction, email addresses, portrait, and cat photos are included. Three preliminary research entries and the COMM 4351 guest lecture are included. Their summaries and resources can be expanded; your CV still awaits its PDF.

**Portrait:** your photo is at `assets/images/portrait.jpg`. To replace it, update `portrait`, `portraitAlt`, `portraitWidth`, and `portraitHeight` in the content file and the corresponding image in `index.html`.

**Research and internships:** add entries to `research` in display order. Replace the example values below; remove optional fields you do not need. Without an image, a numbered thumbnail appears.

```js
research: [
  {
    title: "Your project title",
    summary: "The question, your contribution, and the main finding.",
    year: "2026",
    kind: "Research project", // Or internship, paper, etc.
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

**Teaching:** add entries to `teaching`. The homepage shows the first three; Teaching shows all entries, descriptions, and links. `term` is optional until you have a date. Guest lectures can include `materials: [{ title, summary, url }]` for downloadable notebooks.

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

**CV:** create `assets/documents/`, add `cv.pdf`, and set `cv: { url: "./assets/documents/cv.pdf", updated: "October 2026" }`. The page shows a PDF preview and open-PDF link when supplied.

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

- `index.html`, `teaching.html`, `cv.html`, `cat.html`: public pages.
- `assets/css/style.css`: layout, colors, fonts, motion, and mobile styles.
- `assets/js/content.js`: editable content.
- `assets/js/app.js`: rendering, animal previews, and gallery behavior.
- `assets/js/transition.js`: DOM pixel wave and fade, optional canvas letter vortex, cached page navigation, and browser history. Navigation remains native without JavaScript; slow or failed fetches fall back to normal links instead of extending the animation.
- `assets/PDFs/`, `assets/PowerPoints/`: the semantic-shifts draft and current 3D research summary.
- `assets/Python_notebook/`: downloadable COMM 4351 lecture notebooks. Saved execution logs are cleared; original notebook copies are backed up under `/tmp/ethan-lecture-notebook-originals`.
- `assets/images/cats/`: all six original photos and seven newly supplied cat photos, preserved.
- `assets/fonts/`: local Lato fonts and their Open Font License.
- `docs/design/baseline.png`: accepted design reference.
- `docs/design/tornado-transition.png`: the accepted four-frame reference for the letter transition: a top-down, flat circular spiral pulls letters into the center of the screen, then releases them into the next page. Generated with the built-in imagegen tool; the full prompt is in `docs/design/tornado-transition-prompt.txt`. The optional spiral implements this movement in 1.1 seconds, with a lighter particle budget on phones. The default is the gentler water wave.
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
