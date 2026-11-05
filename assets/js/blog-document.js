const status = document.querySelector('#document-status');
const reader = document.querySelector('#document-reader');
status.textContent = 'Loading article…';

async function openArticle() {
  const pdfjs = await import('../vendor/pdfjs/pdf.min.mjs');
  globalThis.pdfjsLib = pdfjs;
  const { EventBus, PDFViewer, PDFLinkService, LinkTarget } = await import('../vendor/pdfjs/pdf_viewer.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  const eventBus = new EventBus();
  const linkService = new PDFLinkService({ eventBus, externalLinkTarget: LinkTarget.BLANK, externalLinkRel: 'noopener noreferrer' });
  reader.hidden = false;
  const viewer = new PDFViewer({
    container: document.querySelector('#pdf-container'),
    viewer: document.querySelector('#pdf-pages'),
    eventBus, linkService,
    imageResourcesPath: new URL('../vendor/pdfjs/images/', import.meta.url).href,
    annotationMode: pdfjs.AnnotationMode.ENABLE,
  });
  linkService.setViewer(viewer);
  eventBus.on('pagesinit', () => {
    viewer.currentScaleValue = 'page-width';
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
  // Keep the pages fitted to the reader when the window changes size.
  new ResizeObserver(() => {
    if (viewer.pagesCount) viewer.currentScaleValue = 'page-width';
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
