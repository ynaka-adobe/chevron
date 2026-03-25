/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - All parsers for the section-landing template
import heroVideoParser from './parsers/hero-video.js';
import columnsCollageParser from './parsers/columns-collage.js';
import cardsTileParser from './parsers/cards-tile.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import carouselNewsParser from './parsers/carousel-news.js';

// TRANSFORMER IMPORTS - All transformers for Chevron site
import chevronCleanupTransformer from './transformers/chevron-cleanup.js';
import chevronSectionsTransformer from './transformers/chevron-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'section-landing',
  description: 'Top-level section landing page with hero, content sections, and CTAs for major Chevron divisions',
  urls: [
    'https://www.chevron.com/who-we-are',
    'https://www.chevron.com/what-we-do',
    'https://www.chevron.com/sustainability',
    'https://www.chevron.com/investors',
    'https://www.chevron.com/newsroom'
  ],
  blocks: [
    {
      name: 'hero-video',
      instances: ['div.c74']
    },
    {
      name: 'columns-collage',
      instances: ['div.c72 .small-layout-container']
    },
    {
      name: 'cards-tile',
      instances: ['div.c64']
    },
    {
      name: 'columns-feature',
      instances: ['div.c69']
    },
    {
      name: 'carousel-news',
      instances: ['div.c57 section.splide']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Video',
      selector: 'div.c74',
      style: 'dark-gray',
      blocks: ['hero-video'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Belief Statement + Mosaic',
      selector: "div.c06r[class*='background-color-dark-blue']",
      style: 'dark-blue',
      blocks: ['columns-collage'],
      defaultContent: ['div.c06r h2.type-display', 'div.c06r .description', 'div.c06r a.cta-button']
    },
    {
      id: 'section-3',
      name: 'Feature Tiles',
      selector: 'div.c64:first-of-type',
      style: null,
      blocks: ['cards-tile'],
      defaultContent: []
    },
    {
      id: 'section-4',
      name: 'History',
      selector: "div.c06r[class*='background-color-dark-green']",
      style: 'dark-green',
      blocks: [],
      defaultContent: ['div.c06r h2.type-display', 'div.c06r .description', 'div.c06r a.cta-button', 'div.c17e img']
    },
    {
      id: 'section-5',
      name: 'Quality + Feature Links',
      selector: "div.c06r[class*='background-color-white']",
      style: null,
      blocks: ['columns-feature'],
      defaultContent: ['div.c06r h2.type-display', 'div.c06r .description']
    },
    {
      id: 'section-6',
      name: 'News Carousel',
      selector: 'div.c57',
      style: null,
      blocks: ['carousel-news'],
      defaultContent: []
    },
    {
      id: 'section-7',
      name: 'Newsletter Banner',
      selector: 'div.c60',
      style: 'dark-blue',
      blocks: [],
      defaultContent: ['div.c60 h2', 'div.c60 a']
    }
  ]
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-video': heroVideoParser,
  'columns-collage': columnsCollageParser,
  'cards-tile': cardsTileParser,
  'columns-feature': columnsFeatureParser,
  'carousel-news': carouselNewsParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
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
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
