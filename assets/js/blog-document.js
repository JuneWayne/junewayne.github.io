const status = document.querySelector('#document-status');
const reader = document.querySelector('#document-reader');
const controls = document.querySelector('#document-controls');
const pageInput = document.querySelector('#document-page');
const previous = document.querySelector('#page-previous');
const next = document.querySelector('#page-next');
const zoom = document.querySelector('#document-zoom');
const search = document.querySelector('#document-search');
const searchStatus = document.querySelector('#find-status');
status.textContent = 'Loading article…';

async function openArticle() {
  const pdfjs = await import('../vendor/pdfjs/pdf.min.mjs');
  globalThis.pdfjsLib = pdfjs;
  const { EventBus, PDFViewer, PDFLinkService, PDFFindController, LinkTarget } = await import('../vendor/pdfjs/pdf_viewer.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  const eventBus = new EventBus();
  const linkService = new PDFLinkService({ eventBus, externalLinkTarget: LinkTarget.BLANK, externalLinkRel: 'noopener noreferrer' });
  const findController = new PDFFindController({ eventBus, linkService });
  reader.hidden = false;
  const viewer = new PDFViewer({
    container: document.querySelector('#pdf-container'),
    viewer: document.querySelector('#pdf-pages'),
    eventBus, linkService, findController,
    imageResourcesPath: new URL('../vendor/pdfjs/images/', import.meta.url).href,
    annotationMode: pdfjs.AnnotationMode.ENABLE,
  });
  linkService.setViewer(viewer);
  eventBus.on('pagesinit', () => {
    viewer.currentScaleValue = 'page-width';
    const initialPage = Number(new URLSearchParams(location.hash.slice(1)).get('page'));
    if (initialPage >= 1 && initialPage <= viewer.pagesCount) viewer.currentPageNumber = initialPage;
    controls.disabled = false;
    previous.disabled = viewer.currentPageNumber === 1;
    pageInput.max = viewer.pagesCount;
    document.querySelector('#document-count').textContent = `of ${viewer.pagesCount}`;
  });
  eventBus.on('pagerendered', ({ error }) => {
    if (error) {
      status.textContent = 'This page could not be displayed. Use Open PDF to read the original.';
      status.hidden = false;
      return;
    }
    status.hidden = true;
    reader.dataset.ready = 'true';
  });
  eventBus.on('pagechanging', ({ pageNumber }) => {
    pageInput.value = pageNumber;
    previous.disabled = pageNumber === 1;
    next.disabled = pageNumber === viewer.pagesCount;
  });
  previous.addEventListener('click', () => { viewer.currentPageNumber -= 1; });
  next.addEventListener('click', () => { viewer.currentPageNumber += 1; });
  pageInput.addEventListener('change', () => {
    const requestedPage = Math.trunc(Number(pageInput.value));
    viewer.currentPageNumber = Math.max(1, Math.min(viewer.pagesCount, requestedPage || 1));
    pageInput.value = viewer.currentPageNumber;
  });
  zoom.addEventListener('change', () => { viewer.currentScaleValue = zoom.value; });
  let previousQuery = '';
  function findNext() {
    const query = search.value.trim();
    if (!query) { eventBus.dispatch('findbarclose', {}); searchStatus.textContent = ''; previousQuery = ''; return; }
    eventBus.dispatch('find', { source: search, type: query === previousQuery ? 'again' : '', query, caseSensitive: false, entireWord: false, highlightAll: true, findPrevious: false, matchDiacritics: false });
    previousQuery = query;
  }
  search.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); findNext(); } });
  search.addEventListener('search', () => { if (!search.value) findNext(); });
  document.querySelector('#find-next').addEventListener('click', findNext);
  eventBus.on('updatefindmatchescount', ({ matchesCount }) => {
    searchStatus.textContent = `${matchesCount.current} of ${matchesCount.total} matches`;
  });
  eventBus.on('updatefindcontrolstate', ({ state }) => {
    if (state === 1) searchStatus.textContent = 'No matches';
  });
  // Refit responsive pages without resetting a reader's chosen zoom level.
  new ResizeObserver(() => {
    if (!controls.disabled && zoom.value.startsWith('page-')) viewer.currentScaleValue = zoom.value;
  }).observe(document.querySelector('.document-stage'));
  const base = new URL('../vendor/pdfjs/', import.meta.url);
  const pdfDocument = await pdfjs.getDocument({
    url: new URL('../blog/lesswrong-2026-11-05/better-data-curation.pdf', import.meta.url).href,
    cMapUrl: new URL('cmaps/', base).href, cMapPacked: true,
    standardFontDataUrl: new URL('standard_fonts/', base).href,
    wasmUrl: new URL('wasm/', base).href,
    iccUrl: new URL('iccs/', base).href,
    isEvalSupported: false,
  }).promise;
  viewer.setDocument(pdfDocument);
  linkService.setDocument(pdfDocument);
}

openArticle().catch(error => {
  console.error('Could not open the article:', error);
  reader.hidden = true;
  status.hidden = false;
  status.textContent = 'The article reader could not load. Use Open PDF to read the complete article.';
});
