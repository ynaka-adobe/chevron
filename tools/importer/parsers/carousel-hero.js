/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel. Source: https://www.chevron.com/
 * Section 1: Full-width image/video carousel with 6 slides.
 * Each slide has a video/image background, heading, description, and CTA link.
 * Source DOM: div.c70.carousel-shared (instance selector from page-templates.json)
 *   - Slides (media): ul.splide__list > li.splide__slide (non-clone, id=splide02-slide01..06)
 *   - Content: ul.content-list > li.list-item (6 items with heading, description, CTA)
 * Note: Chevron blocks headless browsers; live validation not possible
 */
export default function parse(element, { document }) {
  // Get non-clone slides for images (video posters or background images)
  const slides = Array.from(
    element.querySelectorAll('ul.splide__list > li.splide__slide:not(.splide__slide--clone)')
  );

  // Get content items (headings, descriptions, CTAs)
  const contentItems = Array.from(
    element.querySelectorAll('ul.content-list > li.list-item')
  );

  const cells = [];

  contentItems.forEach((item, index) => {
    // Col 1: Image from corresponding slide
    const imageCell = [];
    if (slides[index]) {
      const img = slides[index].querySelector('img.img-fluid, img');
      const video = slides[index].querySelector('video[poster]');
      if (img) {
        imageCell.push(document.createComment(' field:image '));
        imageCell.push(img);
      } else if (video) {
        const posterSrc = video.getAttribute('poster');
        const videoSrc = video.querySelector('source')?.src || video.getAttribute('src');
        if (posterSrc || videoSrc) {
          const posterImg = document.createElement('img');
          posterImg.src = posterSrc || '';
          posterImg.alt = '';
          const picture = document.createElement('picture');
          picture.appendChild(posterImg);
          if (videoSrc) {
            const videoLink = document.createElement('a');
            videoLink.href = videoSrc;
            videoLink.appendChild(picture);
            imageCell.push(document.createComment(' field:image '));
            imageCell.push(videoLink);
          } else {
            imageCell.push(document.createComment(' field:image '));
            imageCell.push(picture);
          }
        }
      }
    }

    // Col 2: Heading + Description + CTA
    const contentCell = [];
    const heading = item.querySelector('h2.heading, h2, h1, h3');
    const description = item.querySelector('.description');
    const ctaLink = item.querySelector('a.cta-link');

    if (heading || description || ctaLink) {
      contentCell.push(document.createComment(' field:text '));
    }
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);

    if (ctaLink) {
      const link = document.createElement('a');
      link.href = ctaLink.href;
      const underline = ctaLink.querySelector('.cta-underline');
      link.textContent = underline ? underline.textContent.trim() : ctaLink.textContent.trim();
      contentCell.push(link);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
