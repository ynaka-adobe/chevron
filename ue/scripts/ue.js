/**
 * Universal Editor instrumentation for Chevron blocks.
 * Handles UE events when page is loaded in Universal Editor.
 */

import { showSlide as showCarouselHeroSlide } from '../../blocks/carousel-hero/carousel-hero.js';
import { showSlide as showCarouselNewsSlide } from '../../blocks/carousel-news/carousel-news.js';
import { moveInstrumentation } from './ue-utils.js';

const setupObservers = () => {
  const mutatingBlocks = document.querySelectorAll(
    '.block.cards, .block.card, .block.carousel-hero, .block.carousel-news',
  );
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.tagName === 'DIV') {
        const addedElements = mutation.addedNodes;
        const removedElements = mutation.removedNodes;

        const type = mutation.target.closest('.carousel-hero')
          ? 'carousel-hero'
          : mutation.target.closest('.carousel-news')
            ? 'carousel-news'
            : mutation.target.attributes['data-aue-component']?.value;

        switch (type) {
          case 'carousel-hero':
            if (
              removedElements.length === 1
              && removedElements[0].attributes['data-aue-component']?.value === 'carousel-hero-item'
            ) {
              const resourceAttr = removedElements[0].getAttribute('data-aue-resource');
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch?.[1]) {
                  const slideIndex = parseInt(itemMatch[1], 10);
                  const block = mutation.target.closest('.carousel-hero');
                  const slides = block?.querySelectorAll('li.carousel-hero-slide');
                  const targetSlide = slides && Array.from(slides).find(
                    (slide) => parseInt(slide.getAttribute('data-slide-index'), 10) === slideIndex,
                  );
                  if (targetSlide) moveInstrumentation(removedElements[0], targetSlide);
                }
              }
            }
            break;
          case 'carousel-news':
            if (
              removedElements.length === 1
              && removedElements[0].attributes['data-aue-component']?.value === 'carousel-news-item'
            ) {
              const resourceAttr = removedElements[0].getAttribute('data-aue-resource');
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch?.[1]) {
                  const slideIndex = parseInt(itemMatch[1], 10);
                  const block = mutation.target.closest('.carousel-news');
                  const slides = block?.querySelectorAll('li.carousel-news-slide');
                  const targetSlide = slides && Array.from(slides).find(
                    (slide) => parseInt(slide.getAttribute('data-slide-index'), 10) === slideIndex,
                  );
                  if (targetSlide) moveInstrumentation(removedElements[0], targetSlide);
                }
              }
            }
            break;
          case 'cards':
            if (addedElements.length === 1 && addedElements[0].tagName === 'UL') {
              const ulEl = addedElements[0];
              const removedDivEl = [...removedElements].filter((node) => node.tagName === 'DIV');
              removedDivEl.forEach((div, index) => {
                if (index < ulEl.children.length) {
                  moveInstrumentation(div, ulEl.children[index]);
                }
              });
            }
            break;
          default:
            break;
        }
      }
    });
  });

  mutatingBlocks.forEach((block) => {
    observer.observe(block, { childList: true, subtree: true });
  });
};

const setupUEEventHandlers = () => {
  document.body.addEventListener('aue:content-patch', ({ detail: { patch, request } }) => {
    const element = document.querySelector(`[data-aue-resource="${request.target.resource}"]`);
    const el = element?.getAttribute('data-aue-prop') !== patch.name
      ? element?.querySelector(`[data-aue-prop='${patch.name}']`) ?? element
      : element;
    if (el?.getAttribute('data-aue-type') !== 'media') return;

    const picture = el.tagName === 'IMG' ? el.closest('picture') : el;
    picture?.querySelectorAll('source').forEach((source) => source.remove());
    picture?.querySelector('img')?.removeAttribute('srcset');
  });

  document.body.addEventListener('aue:ui-select', (event) => {
    const resource = event.detail?.resource;
    if (!resource) return;

    const element = document.querySelector(`[data-aue-resource="${resource}"]`);
    if (!element) return;

    const blockEl = element.parentElement?.closest('.block[data-aue-resource]')
      || element?.closest('.block[data-aue-resource]');
    if (!blockEl) return;

    const block = blockEl.getAttribute('data-aue-component');
    const index = element.getAttribute('data-slide-index');

    switch (block) {
      case 'carousel-hero':
        if (index) showCarouselHeroSlide(blockEl, parseInt(index, 10));
        break;
      case 'carousel-news':
        if (index) showCarouselNewsSlide(blockEl, parseInt(index, 10));
        break;
      case 'advanced-tabs':
        blockEl.querySelectorAll('[role=tabpanel]').forEach((panel) => {
          panel.setAttribute('aria-hidden', true);
        });
        element.setAttribute('aria-hidden', false);
        blockEl.querySelector('.tab-list')?.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('aria-selected', false);
        });
        blockEl.querySelector(`[aria-controls=${element?.id}]`)?.setAttribute('aria-selected', true);
        break;
      default:
        break;
    }
  });
};

export default () => {
  setupObservers();
  setupUEEventHandlers();
};
