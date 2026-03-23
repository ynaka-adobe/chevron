/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-collage. Base: columns. Source: https://www.chevron.com/
 * Section 5: Grid of 8 image cells in mosaic/collage layout.
 * Source DOM: div.c72 .large-layout-container
 *   - 8 cells: div.image-cell (ids: mod_d096fbc1_1 through mod_d096fbc1_8)
 *   - Images loaded via CSS background-image, not img tags
 * Columns block: multiple columns per row, each cell with content.
 * Layout: 2 rows of 4 columns to represent the mosaic grid.
 * Chevron blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  const imageCells = Array.from(element.querySelectorAll('.image-cell, [class*="image-cell"]'));

  const cells = [];

  // Each image cell becomes one row (container item) with image and optional text
  for (let i = 0; i < imageCells.length; i++) {
    const img = imageCells[i].querySelector('img');
    const itemCell = [];
    if (img) {
      itemCell.push(document.createComment(' field:image '));
      itemCell.push(img);
    } else {
      // Image-cell may use background-image CSS; create placeholder reference
      const p = document.createElement('p');
      p.textContent = imageCells[i].id || `image-cell-${i + 1}`;
      itemCell.push(document.createComment(' field:image '));
      itemCell.push(p);
    }
    cells.push([itemCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-collage', cells });
  block.classList.add('large-layout-container');
  element.replaceWith(block);
}
