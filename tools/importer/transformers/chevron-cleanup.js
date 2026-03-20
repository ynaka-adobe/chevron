/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron site cleanup.
 * Selectors from captured DOM of https://www.chevron.com/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove Splide clone slides (created by Splide JS for infinite loop, not authorable)
    // Found in captured HTML: <li class="splide__slide ... splide__slide--clone">
    WebImporter.DOMUtils.remove(element, ['.splide__slide--clone']);

    // Remove carousel pagination/controls (UI chrome, not authorable)
    // Found in captured HTML: <div class="control show ...">
    WebImporter.DOMUtils.remove(element, [
      '.splide__pagination',
      '.splide__arrows',
      '.pause-container',
      '.control',
    ]);

    // Remove OneTrust cookie consent dialog (non-authorable)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#ot-sdk-cookie-policy',
      '[class*="onetrust"]',
      '[id*="onetrust"]',
      '[id*="ot-sdk"]',
    ]);

    // Remove skip-to-content and back-to-top links
    const skipLinks = element.querySelectorAll('a[href="#main-content"], a[href="#top"]');
    skipLinks.forEach((link) => {
      const parent = link.parentElement;
      if (parent && parent.tagName === 'P' && parent.children.length === 1) {
        parent.remove();
      } else {
        link.remove();
      }
    });
  }

  if (hookName === H.after) {
    // Remove header, footer, navigation (non-authorable site chrome)
    // Full page DOM has header/footer outside <main>
    WebImporter.DOMUtils.remove(element, ['header', 'footer', 'nav']);

    // Remove newsletter subscription modal (non-authorable site chrome)
    // Found in captured HTML: <div id="mod_38130ff8" class="a13 ... modal">
    WebImporter.DOMUtils.remove(element, ['div.a13.modal']);

    // Remove noscript and link elements
    WebImporter.DOMUtils.remove(element, ['noscript', 'link', 'iframe']);

    // Remove tracking pixels (Twitter/analytics images)
    element.querySelectorAll('img[src*="t.co/"], img[src*="analytics.twitter.com"], img[src*="cdn.cookielaw.org"]').forEach((img) => {
      const parent = img.parentElement;
      img.remove();
      // Clean up empty parent paragraphs left behind
      if (parent && parent.tagName === 'P' && parent.children.length === 0 && !parent.textContent.trim()) {
        parent.remove();
      }
    });

    // Clean up data-cvx tracking attributes (non-authorable)
    element.querySelectorAll('[data-cvx-first-module-no-adjustment], [data-cvx-module-name], [data-cvx-media-desktop], [data-cvx-media-mobile], [data-cvx-video-index], [data-cvx-first-module-exclude]').forEach((el) => {
      el.removeAttribute('data-cvx-first-module-no-adjustment');
      el.removeAttribute('data-cvx-module-name');
      el.removeAttribute('data-cvx-media-desktop');
      el.removeAttribute('data-cvx-media-mobile');
      el.removeAttribute('data-cvx-video-index');
      el.removeAttribute('data-cvx-first-module-exclude');
    });
  }
}
