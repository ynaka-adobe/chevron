/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero. Source: https://www.chevron.com/
 * Section 6: Full-width looping ambient video with poster image.
 * Source DOM: div.c17e .media-container.video-container
 *   - Video: video.video.background with poster ./images/947050babb6f.jpg
 *   - Poster fallback: img.img-fluid inside video element
 *   - Play/pause button (non-authorable, ignored)
 * Hero block: Row 1: background image (poster). Row 2: video source link.
 * Site blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Video poster image as background
  const video = element.querySelector('video[poster], video');
  const posterImg = element.querySelector('video img.img-fluid, video img');
  const standaloneImg = element.querySelector('img.img-fluid, img');

  if (posterImg) {
    cells.push([posterImg]);
  } else if (video && video.getAttribute('poster')) {
    const img = document.createElement('img');
    img.src = video.getAttribute('poster');
    img.alt = 'Ambient video poster';
    cells.push([img]);
  } else if (standaloneImg) {
    cells.push([standaloneImg]);
  }

  // Row 2: Video source link (so authors know which video to use)
  const videoSrc = video ? (video.querySelector('source') || {}).src || video.getAttribute('src') : null;
  if (videoSrc) {
    const contentCell = [];
    const link = document.createElement('a');
    link.href = videoSrc;
    link.textContent = videoSrc;
    contentCell.push(link);
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
