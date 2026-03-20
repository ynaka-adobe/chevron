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

  // Row 1: first 4 image cells
  const row1 = [];
  for (let i = 0; i < Math.min(4, imageCells.length); i++) {
    const img = imageCells[i].querySelector('img');
    if (img) {
      row1.push(img);
    } else {
      // Image-cell may use background-image CSS; create placeholder reference
      const p = document.createElement('p');
      p.textContent = imageCells[i].id || `image-cell-${i + 1}`;
      row1.push(p);
    }
  }
  if (row1.length > 0) cells.push(row1);

  // Row 2: remaining 4 image cells
  const row2 = [];
  for (let i = 4; i < Math.min(8, imageCells.length); i++) {
    const img = imageCells[i].querySelector('img');
    if (img) {
      row2.push(img);
    } else {
      const p = document.createElement('p');
      p.textContent = imageCells[i].id || `image-cell-${i + 1}`;
      row2.push(p);
    }
  }
  if (row2.length > 0) cells.push(row2);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-collage', cells });
  element.replaceWith(block);
}
