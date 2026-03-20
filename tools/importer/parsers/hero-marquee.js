/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-marquee. Base: hero. Source: https://www.chevron.com/
 * Section 2: "Who we are" text marquee with animated heading and overlapping images.
 * Source DOM: div.text-marquee.background-color-dark-blue
 *   - Eyebrow: p.type-eyebrow ("Who we are")
 *   - Heading: h2.type-display with span.text-animation children
 *   - Images: div.images-container img (3 photos)
 * Hero block: Row 1: background image. Row 2: title + subheading + CTA.
 * Note: Chevron blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: First image as background
  const images = Array.from(element.querySelectorAll('.images-container img, .image img'));
  if (images.length > 0) {
    cells.push([images[0]]);
  }

  // Row 2: Eyebrow + heading with animated words + remaining images
  const contentCell = [];

  const eyebrow = element.querySelector('p.type-eyebrow');
  if (eyebrow) contentCell.push(eyebrow);

  const heading = element.querySelector('h2.type-display, h2.heading');
  if (heading) {
    // Rebuild heading with animated words as plain text
    const words = Array.from(heading.querySelectorAll('span.text-animation'));
    if (words.length > 0) {
      const h2 = document.createElement('h2');
      h2.textContent = words.map((w) => w.textContent.trim()).join(', ');
      contentCell.push(h2);
    } else {
      contentCell.push(heading);
    }
  }

  // Add remaining images as inline content
  for (let i = 1; i < images.length; i++) {
    contentCell.push(images[i]);
  }

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-marquee', cells });
  element.replaceWith(block);
}
