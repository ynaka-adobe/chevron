#!/usr/bin/env node
/**
 * Add UE field hints (<!-- field:xxx -->) to existing EDS content HTML.
 * This modifies block cell content in-place without re-importing from the source site.
 */
import { readFileSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const filePath = process.argv[2] || 'content/index.plain.html';
const html = readFileSync(filePath, 'utf-8');

// Wrap in a full HTML document for JSDOM
const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
const doc = dom.window.document;

/**
 * Add a field hint comment as the first child of a cell element.
 * Only adds if the cell has content (non-empty).
 */
function addHint(cell, fieldName) {
  if (!cell || !cell.innerHTML.trim()) return; // Skip empty cells
  const comment = doc.createComment(` field:${fieldName} `);
  cell.insertBefore(comment, cell.firstChild);
}

// --- carousel-hero ---
const carouselHero = doc.querySelector('.carousel-hero');
if (carouselHero) {
  const rows = carouselHero.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      addHint(cells[0], 'image'); // Col 1: image
      addHint(cells[1], 'text');  // Col 2: text content
    }
  });
  console.log(`carousel-hero: ${rows.length} slides hinted`);
}

// --- hero-marquee ---
const heroMarquee = doc.querySelector('.hero-marquee');
if (heroMarquee) {
  const rows = heroMarquee.querySelectorAll(':scope > div');
  if (rows.length >= 1) {
    // Row 1: contains image cell(s) - hint the first cell that has an img
    const row1Cells = rows[0].querySelectorAll(':scope > div');
    if (row1Cells.length > 0) addHint(row1Cells[0], 'image');
  }
  if (rows.length >= 2) {
    // Row 2: text content - hint the entire row's first cell
    const row2 = rows[1];
    // The row itself contains multiple divs (eyebrow, heading, images)
    // Add hint before the first child
    if (row2.innerHTML.trim()) {
      const comment = doc.createComment(' field:text ');
      row2.insertBefore(comment, row2.firstChild);
    }
  }
  console.log(`hero-marquee: hinted`);
}

// --- columns-collage ---
const columnsCollage = doc.querySelector('.columns-collage');
if (columnsCollage) {
  const rows = columnsCollage.querySelectorAll(':scope > div');
  let cellCount = 0;
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    cells.forEach((cell) => {
      addHint(cell, 'image');
      cellCount++;
    });
  });
  console.log(`columns-collage: ${cellCount} cells hinted`);
}

// --- carousel-news ---
const carouselNews = doc.querySelector('.carousel-news');
if (carouselNews) {
  const rows = carouselNews.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      addHint(cells[0], 'image'); // Col 1: image
      addHint(cells[1], 'text');  // Col 2: text content
    }
  });
  console.log(`carousel-news: ${rows.length} slides hinted`);
}

// --- hero-video (if present) ---
const heroVideo = doc.querySelector('.hero-video');
if (heroVideo) {
  const rows = heroVideo.querySelectorAll(':scope > div');
  if (rows.length >= 1) {
    const cells1 = rows[0].querySelectorAll(':scope > div');
    if (cells1.length > 0) addHint(cells1[0], 'image');
    else addHint(rows[0], 'image');
  }
  if (rows.length >= 2) {
    const cells2 = rows[1].querySelectorAll(':scope > div');
    if (cells2.length > 0) addHint(cells2[0], 'text');
    else addHint(rows[1], 'text');
  }
  console.log(`hero-video: hinted`);
}

// Extract the modified content (just the body innerHTML, split by sections)
const body = doc.querySelector('body');
const sections = body.querySelectorAll(':scope > div');
const output = Array.from(sections).map((s) => s.outerHTML).join('\n');

writeFileSync(filePath, output, 'utf-8');
console.log(`\nField hints written to ${filePath}`);
