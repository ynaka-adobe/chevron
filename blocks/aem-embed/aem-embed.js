/**
 * Embeds AEM-managed content via the official AEM Embed web component.
 * Loads /scripts/aem-embed.js (same origin) for CSP compatibility.
 * @see https://www.aem.live/docs/aem-embed
 */
const AEM_EMBED_SCRIPT = new URL('/scripts/aem-embed.js', window.location.origin).href;

let scriptLoadPromise;

/**
 * Plain HTML often stores root-relative href with the real stack URL only in link text
 * (e.g. href="/banners/banner1" but text is https://main--other--org.aem.page/banners/banner1).
 */
const AEM_EXPLICIT_URL_RE = /https:\/\/[^<\s"']+\.aem\.(?:live|page)(?:\/[^<\s"']*)?/i;

function extractExplicitAemUrl(text) {
  if (!text?.trim()) return null;
  const m = text.match(AEM_EXPLICIT_URL_RE);
  if (!m) return null;
  try {
    const u = new URL(m[0]);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Origin from meta urn:aem:editor:aemconnection (e.g. aem:https://main--site--org.aem.live).
 * Used so root-relative or localhost embed URLs fetch .plain.html from AEM, not the dev server.
 */
function getAemConnectionOrigin() {
  const meta = document.querySelector('meta[name="urn:aem:editor:aemconnection"]')?.content;
  if (!meta?.startsWith('aem:')) return null;
  try {
    return new URL(meta.slice(4)).origin;
  } catch {
    return null;
  }
}

/**
 * @param {string} hrefOrPath - absolute URL, or path like /fragments/foo
 * @returns {string|null}
 */
function resolveEmbedUrl(hrefOrPath) {
  if (!hrefOrPath?.trim()) return null;
  const aemOrigin = getAemConnectionOrigin();
  const trimmed = hrefOrPath.trim();

  let u;
  try {
    u = new URL(trimmed);
  } catch {
    try {
      u = new URL(trimmed, window.location.href);
    } catch {
      return null;
    }
  }

  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const pointsAtDevServer =
    isLocalDev &&
    (u.origin === window.location.origin ||
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1');

  if (pointsAtDevServer && aemOrigin) {
    return `${aemOrigin}${u.pathname}${u.search}`;
  }

  if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  return null;
}

function loadAemEmbedScript() {
  if (customElements.get('aem-embed')) {
    return Promise.resolve();
  }
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-aem-embed-loader]');
      if (existing) {
        if (customElements.get('aem-embed')) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('aem-embed script failed')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = AEM_EMBED_SCRIPT;
      script.dataset.aemEmbedLoader = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load /scripts/aem-embed.js'));
      document.head.append(script);
    });
  }
  return scriptLoadPromise;
}

function parseEmbedUrl(block) {
  const link = block.querySelector('a[href]');
  if (link) {
    const fromAuthor = extractExplicitAemUrl(link.textContent)
      || extractExplicitAemUrl(link.getAttribute('title'));
    if (fromAuthor) return fromAuthor;
    const resolved = resolveEmbedUrl(link.getAttribute('href') || link.href);
    if (resolved) return resolved;
  }
  const raw = block.querySelector(':scope > div')?.textContent?.trim();
  if (raw) {
    const fromAuthor = extractExplicitAemUrl(raw);
    if (fromAuthor) return fromAuthor;
    const resolved = resolveEmbedUrl(raw);
    if (resolved) return resolved;
  }
  return null;
}

function parseEmbedType(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (rows.length < 2) return '';
  const text = rows[1].textContent?.trim().toLowerCase() ?? '';
  if (text === 'header' || text === 'footer') return text;
  return '';
}

export default async function decorate(block) {
  const url = parseEmbedUrl(block);
  const type = parseEmbedType(block);

  block.innerHTML = '';

  if (!url) {
    block.classList.add('aem-embed--error');
    const msg = document.createElement('p');
    msg.className = 'aem-embed-error';
    msg.textContent = 'AEM Embed: add a valid https URL (link or first row text).';
    block.append(msg);
    return;
  }

  try {
    await loadAemEmbedScript();
    await customElements.whenDefined('aem-embed');
  } catch (e) {
    block.classList.add('aem-embed--error');
    const msg = document.createElement('p');
    msg.className = 'aem-embed-error';
    msg.textContent = 'Could not load AEM Embed. Ensure /scripts/aem-embed.js is deployed.';
    block.append(msg);
    return;
  }

  const embed = document.createElement('aem-embed');
  embed.setAttribute('url', url);
  if (type) embed.setAttribute('type', type);
  block.append(embed);
}
