/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - All parsers for the homepage template
import carouselHeroParser from './parsers/carousel-hero.js';
import heroMarqueeParser from './parsers/hero-marquee.js';
import columnsCollageParser from './parsers/columns-collage.js';
import heroVideoParser from './parsers/hero-video.js';
import carouselNewsParser from './parsers/carousel-news.js';

// TRANSFORMER IMPORTS - All transformers for Chevron site
import chevronCleanupTransformer from './transformers/chevron-cleanup.js';
import chevronSectionsTransformer from './transformers/chevron-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Chevron corporate homepage with hero carousel, featured content sections, image collage, ambient video, and news carousel',
  urls: [
    'https://www.chevron.com/'
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['div.c70.carousel-shared']
    },
    {
      name: 'hero-marquee',
      instances: ['div.text-marquee.background-color-dark-blue']
    },
    {
      name: 'columns-collage',
      instances: ['div.c72 .large-layout-container']
    },
    {
      name: 'hero-video',
      instances: ['div.c17e .media-container.video-container']
    },
    {
      name: 'carousel-news',
      instances: ['div.c57.carousel-shared section.splide']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Image Carousel',
      selector: 'div.c70.carousel-shared',
      style: 'dark-blue',
      blocks: ['carousel-hero'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Who We Are Text Marquee',
      selector: 'div.text-marquee.background-color-dark-blue',
      style: 'dark-blue',
      blocks: ['hero-marquee'],
      defaultContent: []
    },
    {
      id: 'section-3',
      name: 'Mission Statement',
      selector: 'div#mod_8cb55247.c85',
      style: 'dark-blue',
      blocks: [],
      defaultContent: ['div#mod_8cb55247 .description.type-subhead', 'div#mod_8cb55247 a.cta-button']
    },
    {
      id: 'section-4',
      name: 'What We Do Intro',
      selector: 'div#mod_5865131d.c06r',
      style: null,
      blocks: [],
      defaultContent: ['div#mod_5865131d p.type-eyebrow', 'div#mod_5865131d h2.type-display', 'div#mod_5865131d .description', 'div#mod_5865131d a.cta-button']
    },
    {
      id: 'section-5',
      name: 'Image Collage Grid',
      selector: 'div#mod_d096fbc1.c72',
      style: null,
      blocks: ['columns-collage'],
      defaultContent: []
    },
    {
      id: 'section-6',
      name: 'Ambient Video',
      selector: 'div#mod_1fc0c06b.c17e',
      style: null,
      blocks: ['hero-video'],
      defaultContent: []
    },
    {
      id: 'section-7',
      name: 'People Who Power CTA',
      selector: 'div#mod_24c3b03c.c06r',
      style: null,
      blocks: [],
      defaultContent: ['div#mod_24c3b03c h2.type-display', 'div#mod_24c3b03c .description', 'div#mod_24c3b03c a.cta-button']
    },
    {
      id: 'section-8',
      name: 'Latest at Chevron News Carousel',
      selector: 'div#mod_85834f74.c57',
      style: null,
      blocks: ['carousel-news'],
      defaultContent: ['div#mod_85834f74 .opening-content p.type-eyebrow', 'div#mod_85834f74 .opening-content h3.type-header']
    }
  ]
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'carousel-hero': carouselHeroParser,
  'hero-marquee': heroMarqueeParser,
  'columns-collage': columnsCollageParser,
  'hero-video': heroVideoParser,
  'carousel-news': carouselNewsParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Cleanup runs first, sections runs in afterTransform after block parsing
const transformers = [
  chevronCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [chevronSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path: path || '/index',
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
