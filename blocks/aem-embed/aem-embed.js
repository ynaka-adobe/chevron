/**
 * Embeds AEM-managed content via the official AEM Embed web component.
 * Loads /scripts/aem-embed.js (same origin) for CSP compatibility.
 * @see https://www.aem.live/docs/aem-embed
 */
const AEM_EMBED_SCRIPT = new URL('/scripts/aem-embed.js', window.location.origin).href;

let scriptLoadPromise;

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
  if (link?.href) {
    try {
      const u = new URL(link.href);
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
    } catch {
      return null;
    }
  }
  const raw = block.querySelector(':scope > div')?.textContent?.trim();
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
    } catch {
      return null;
    }
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
