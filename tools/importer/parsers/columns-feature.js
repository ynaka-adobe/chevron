/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns. Source: https://www.chevron.com/who-we-are
 * Section 5: Side-by-side feature (c69 module) with background image + colored text panel.
 * Source DOM: div.c69
 *   - Background image: div.background-container .background (CSS background-image)
 *   - Text panel: div.text-container with h2 + description + CTA link
 *   - Layout: left or right (class on parent div.c69)
 * Columns block: 2 cols per row. Col 1: image. Col 2: heading + description + CTA.
 * Chevron blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  const cells = [];

  // Col 1: Background image
  const col1 = [];
  const bgDiv = element.querySelector('.background-container .background');
  if (bgDiv) {
    const style = bgDiv.getAttribute('style') || '';
    const urlMatch = style.match(/url\(([^)]+)\)/);
    if (urlMatch) {
      const img = document.createElement('img');
      img.src = urlMatch[1].replace(/['"]/g, '');
      img.alt = '';
      col1.push(document.createComment(' field:image '));
      col1.push(img);
    }
  }

  // Col 2: Text content
  const col2 = [];
  const textContainer = element.querySelector('.text-container');
  if (textContainer) {
    col2.push(document.createComment(' field:text '));
    const heading = textContainer.querySelector('h2');
    if (heading) col2.push(heading);

    const desc = textContainer.querySelector('.description');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      col2.push(p);
    }

    const ctaLink = textContainer.querySelector('a.cta-link, a[href]');
    if (ctaLink) {
      const link = document.createElement('a');
      link.href = ctaLink.href;
      const ctaText = textContainer.querySelector('.cta-underline');
      link.textContent = ctaText ? ctaText.textContent.trim() : ctaLink.textContent.trim();
      const p = document.createElement('p');
      p.append(link);
      col2.push(p);
    }
  }

  if (col1.length > 0 || col2.length > 0) {
    cells.push([col1, col2]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
