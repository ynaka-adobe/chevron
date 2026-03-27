import { loadArea } from '../../scripts/ak.js';

/** Same origin as head.html urn:aem:editor:aemconnection — content is not served at localhost. */
function getAemConnectionOrigin() {
  const meta = document.querySelector('meta[name="urn:aem:editor:aemconnection"]')?.content;
  if (!meta?.startsWith('aem:')) return null;
  try {
    return new URL(meta.slice(4)).origin;
  } catch {
    return null;
  }
}

/** Fetch published fragments from AEM when the page is opened on localhost. */
function resolveFragmentFetchUrl(path) {
  if (!path || typeof path !== 'string') return path;
  const isLocalDev = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1';
  const aemOrigin = getAemConnectionOrigin();
  if (isLocalDev && aemOrigin && path.startsWith('/')) {
    return `${aemOrigin}${path}`;
  }
  return path;
}

function replaceDotMedia(mediaBaseHref, doc) {
  const resetAttributeBase = (tag, attr) => {
    doc.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
      el[attr] = new URL(el.getAttribute(attr), mediaBaseHref).href;
    });
  };
  resetAttributeBase('img', 'src');
  resetAttributeBase('source', 'srcset');
}

/**
 * Inject a fragment into the dom to for calculating styles
 * @param {HTMLElement} fragment the fragment
 */
function applyPageStyles(fragment) {
  const container = document.createElement('div');
  container.classList.add('hidden-container');
  container.style = 'display: none';
  document.body.append(container);
  container.append(fragment);
  return container;
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  const fetchUrl = resolveFragmentFetchUrl(path);
  const resp = await fetch(fetchUrl);
  if (!resp.ok) throw Error(`Couldn't fetch ${path}`);

  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const sections = doc.body.querySelectorAll('main > div');
  const fragment = document.createElement('div');
  fragment.classList.add('fragment-content');
  fragment.append(...sections);

  const mediaBaseHref = fetchUrl.startsWith('http')
    ? fetchUrl
    : new URL(path, window.location.href).href;
  replaceDotMedia(mediaBaseHref, fragment);

  const container = applyPageStyles(fragment);

  await loadArea({ area: fragment });

  fragment.remove();
  container.remove();

  return fragment;
}

/**
 *
 * @param {Element}} a the fragment link
 * @returns the element that can be replaced
 */
function getReplaceEl(a) {
  let current = a;
  const ancestor = a.closest('.section');

  // Walk up the DOM from child to ancestor
  // Break when there is more than one child
  while (current && current !== ancestor) {
    const childCount = current.parentElement.children.length;
    if (childCount <= 1) {
      current = current.parentElement;
    } else {
      break;
    }
  }

  return current;
}

function getRequestPath(a) {
  const { hostname, pathname } = a;
  const href = a.getAttribute('href');
  // If its already relative, return the pathname
  if (href.startsWith('/')) return pathname;
  // If the hostname matches, return the pathname
  if (hostname === window.location.hostname) return pathname;
  // If the aem project matches, make it relative (useful across delivery tiers)
  const isAem = ['.da.', '.aem.', 'local'].some((host) => hostname.includes(host));
  if (isAem) {
    // If org and site matches, return the pathname
    const [aemOrg, aemSite] = hostname.split('.')[0].split('--').reverse();
    const [winOrg, winSite] = window.location.hostname.split('.')[0].split('--').reverse();
    if ((aemOrg === winOrg) && (aemSite === winSite)) return pathname;
  }
  // Give up and return the full href
  return a.href;
}

export default async function init(a) {
  const path = getRequestPath(a);

  const fragment = await loadFragment(path);
  if (fragment) {
    const elToReplace = getReplaceEl(a);
    const sections = fragment.querySelectorAll(':scope > .section');
    const children = sections.length === 1
      ? fragment.querySelectorAll(':scope > *')
      : [fragment];
    for (const [idx, child] of children.entries()) {
      // If relative, create a unique ID to help fragments be identified after being inserted into the page
      if (path.startsWith('/')) child.id = btoa(encodeURIComponent(`${path}/${idx + 1}`));
      elToReplace.insertAdjacentElement('afterend', child);
    }
    elToReplace.remove();
  }
}
