/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Source: https://www.chevron.com/
 * Handles two patterns:
 *   1. c17e: Standalone ambient video (homepage) - video + poster image
 *   2. c74: Hero video with text overlay (section pages) - video + h1 + description
 * Hero block: Row 1: background image/poster. Row 2: heading + description + video link.
 */
export default function parse(element, { document }) {
  const cells = [];
  const video = element.querySelector('video[poster], video');
  const posterImg = element.querySelector('video img.img-fluid, video img');
  const standaloneImg = element.querySelector('img.img-fluid, img');

  // Row 1: Video poster image as background
  if (posterImg) {
    cells.push([document.createComment(' field:image '), posterImg]);
  } else if (video && video.getAttribute('poster')) {
    const img = document.createElement('img');
    img.src = video.getAttribute('poster');
    img.alt = 'Video poster';
    cells.push([document.createComment(' field:image '), img]);
  } else if (standaloneImg) {
    cells.push([document.createComment(' field:image '), standaloneImg]);
  }

  // Row 2: Text content + video link
  const contentCell = [];
  contentCell.push(document.createComment(' field:text '));

  // c74 pattern: h1 heading + description text
  const heading = element.querySelector('h1, .text-window-container h1');
  const description = element.querySelector('.description-container .description, .description');
  if (heading) contentCell.push(heading);
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.push(p);
  }

  // Video source link
  const videoSrc = video ? (video.querySelector('source') || {}).src || video.getAttribute('src') : null;
  if (videoSrc) {
    const link = document.createElement('a');
    link.href = videoSrc;
    link.textContent = videoSrc;
    contentCell.push(link);
  }

  if (contentCell.length > 1) cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
