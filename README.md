# Ethan (Yisong) Cao’s personal website

A white research portfolio with Lato typography, a photo-and-bio introduction, research stories, Teaching and CV pages, and Layla’s photo album. The homepage includes an Animals section. Background dots are static; short section transitions honor reduced-motion preferences.

Built with HTML, CSS, and JavaScript modules. No production dependencies or build step; GitHub Pages can serve the files directly.

## Preview

With Node.js 20 or newer, run `npm run dev` and open <http://127.0.0.1:5173>. To change the port: `npm run dev -- --port 8080`.

## Add your content

Edit [`assets/js/content.js`](assets/js/content.js). Your UVA introduction and email addresses are included. Research, TA courses, your portrait, and your CV await your real content.

**Portrait:** add `assets/images/portrait.jpg` and set `portrait: "./assets/images/portrait.jpg"`.

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

**Teaching:** add entries to `teaching`. The homepage shows the first three; Teaching shows all entries, descriptions, and links.

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
  description: "The story behind this moment.",
  category: "Layla",
},
```

Use displayed pixel dimensions, accounting for camera rotation. Categories become filters automatically. Arrow keys browse the photo viewer; Escape closes it. Update `cat.hero`, `cat.heroAlt`, `cat.bio`, and `cat.loves` to change the introduction.

The homepage also contains a static biography for search engines and visitors without JavaScript. If you change your introduction, update the matching text and contact links in `index.html`. Page titles and descriptions live in the HTML files.

## Files

- `index.html`, `teaching.html`, `cv.html`, `cat.html`: public pages.
- `assets/css/style.css`: layout, colors, fonts, motion, and mobile styles.
- `assets/js/content.js`: editable content.
- `assets/js/app.js`: rendering, section transitions, animal previews, and gallery behavior.
- `assets/images/cats/`: all six original photos, preserved.
- `assets/fonts/`: local Lato fonts and their Open Font License.
- `docs/design/baseline.png`: accepted design reference.
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
