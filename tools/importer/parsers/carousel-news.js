/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-news. Base: carousel. Source: https://www.chevron.com/
 * Section 8: News article card carousel with 6 slides.
 * Source DOM: div.c57.carousel-shared section.splide
 *   - Slides: div.splide__list > div.splide__slide
 *   - Each slide: a.cta-link-parent wrapping card content
 *     - Image: div.image-container > img.img-fluid
 *     - Date: p.date
 *     - Headline: h4.slide-header
 *     - CTA: span.cta-underline ("read article")
 * Carousel block: 2 cols per row. Col 1: image. Col 2: date + headline + CTA link.
 * Chevron site blocks headless browsers - live validation not possible
 */
export default function parse(element, { document }) {
  // Get all article slides (non-clone)
  const slides = Array.from(
    element.querySelectorAll('.splide__list > .splide__slide, .splide__list > div[role="tabpanel"]')
  );

  const cells = [];

  slides.forEach((slide) => {
    // Col 1: Article thumbnail image
    const imageCell = [];
    const img = slide.querySelector('.image-container img, img.img-fluid, img');
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    // Col 2: Date + Headline + Link
    const contentCell = [];

    const date = slide.querySelector('p.date, .date');
    const headline = slide.querySelector('h4.slide-header, h4, h3');
    const articleLink = slide.querySelector('a.cta-link-parent, a[href]');

    if (date || headline || articleLink) {
      contentCell.push(document.createComment(' field:text '));
    }

    if (date) contentCell.push(date);
    if (headline) contentCell.push(headline);

    // Extract article link from wrapping anchor
    if (articleLink) {
      const link = document.createElement('a');
      link.href = articleLink.href;
      const ctaText = slide.querySelector('.cta-underline');
      link.textContent = ctaText ? ctaText.textContent.trim() : 'Read article';
      contentCell.push(link);
    }

    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}
