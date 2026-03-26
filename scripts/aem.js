/**
 * Compatibility shim for AEM Embed web component (expects scripts/aem.js).
 * @see https://www.aem.live/docs/aem-embed
 */

/**
 * Build a Franklin-style block wrapper (one row, one cell).
 * @param {string} blockName
 * @param {string} content HTML or empty
 * @returns {HTMLDivElement}
 */
export function buildBlock(blockName, content) {
  const block = document.createElement('div');
  block.className = 'block';
  block.classList.add(blockName);
  const row = document.createElement('div');
  const cell = document.createElement('div');
  row.append(cell);
  block.append(row);
  if (content) cell.innerHTML = content;
  return block;
}
