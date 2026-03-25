/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile. Base: cards. Source: https://www.chevron.com/who-we-are
 * Section 3: Feature tiles (c64 module) with half-tile text + quarter-tile image + CTA card.
 * Source DOM: div.c64
 *   - Half-tile: div.half-tile with h2 heading + description
 *   - Quarter-tile image: div.quarter-tile.background-container with background-image
 *   - Quarter-tile CTA: div.quarter-tile with h3 + CTA link
 * Cards block: 2 cols per row. Col 1: heading + description. Col 2: image + CTA heading + CTA link.
 * Chevron blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  const cells = [];

  // Col 1: Half-tile text content (heading + description)
  const halfTile = element.querySelector('.half-tile:not(.quarter-tile-container)');
  const col1 = [];
  if (halfTile) {
    const heading = halfTile.querySelector('h2');
    const desc = halfTile.querySelector('.description');
    col1.push(document.createComment(' field:text '));
    if (heading) col1.push(heading);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      col1.push(p);
    }
  }

  // Col 2: Quarter-tile image + CTA card
  const col2 = [];
  const bgContainer = element.querySelector('.quarter-tile.background-container .background');
  if (bgContainer) {
    const style = bgContainer.getAttribute('style') || '';
    const urlMatch = style.match(/url\(([^)]+)\)/);
    if (urlMatch) {
      const img = document.createElement('img');
      img.src = urlMatch[1].replace(/['"]/g, '');
      img.alt = '';
      col2.push(document.createComment(' field:image '));
      col2.push(img);
    }
  }

  const ctaTile = element.querySelector('.quarter-tile:not(.background-container):not(.quarter-tile-container)');
  if (ctaTile) {
    const ctaHeading = ctaTile.querySelector('h3');
    const ctaLink = ctaTile.querySelector('a.cta-link-parent, a[href]');
    if (ctaHeading) col2.push(ctaHeading);
    if (ctaLink) {
      const link = document.createElement('a');
      link.href = ctaLink.href;
      const ctaText = ctaTile.querySelector('.cta-underline');
      link.textContent = ctaText ? ctaText.textContent.trim() : 'Learn more';
      const p = document.createElement('p');
      p.append(link);
      col2.push(p);
    }
  }

  if (col1.length > 0 || col2.length > 0) {
    cells.push([col1, col2]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
