import { loadArea, setConfig } from './ak.js';

/**
 * Used by AEM Embed when embedding fragments (same API as Franklin boilerplate).
 * @param {HTMLElement} main
 */
export async function decorateMain(main) {
  await loadArea({ area: main });
}

// UE Editor support before page load
// Load when: da.live UE (*.ue.da.live) OR in iframe (experience.adobe.com canvas)
const isDaLiveUE = /\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname);
const isUEIframe = window.self !== window.top; // Page in UE canvas from experience.adobe.com
if (isDaLiveUE || isUEIframe) {
  const basePath = window.hlx?.codeBasePath ?? window.location.origin;
  import(`${basePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue()).catch(() => {});
}

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = () => {
  // eagerLoad removed - setting fetchPriority on images triggers about:error
  // when loads fail (CORS, proxy, UE iframe). LCP impact is minimal.
};

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();
}

// Suppress full-page load when AEM Embed loads scripts.js inside an embed (see aem-embed.js)
if (!window.hlx?.suppressLoadPage) {
  await loadPage();
}

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
