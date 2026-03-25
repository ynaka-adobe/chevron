var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-section-landing.js
  var import_section_landing_exports = {};
  __export(import_section_landing_exports, {
    default: () => import_section_landing_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document }) {
    const cells = [];
    const video = element.querySelector("video[poster], video");
    const posterImg = element.querySelector("video img.img-fluid, video img");
    const standaloneImg = element.querySelector("img.img-fluid, img");
    if (posterImg) {
      cells.push([document.createComment(" field:image "), posterImg]);
    } else if (video && video.getAttribute("poster")) {
      const img = document.createElement("img");
      img.src = video.getAttribute("poster");
      img.alt = "Video poster";
      cells.push([document.createComment(" field:image "), img]);
    } else if (standaloneImg) {
      cells.push([document.createComment(" field:image "), standaloneImg]);
    }
    const contentCell = [];
    contentCell.push(document.createComment(" field:text "));
    const heading = element.querySelector("h1, .text-window-container h1");
    const description = element.querySelector(".description-container .description, .description");
    if (heading) contentCell.push(heading);
    if (description) {
      const p = document.createElement("p");
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }
    const videoSrc = video ? (video.querySelector("source") || {}).src || video.getAttribute("src") : null;
    if (videoSrc) {
      const link = document.createElement("a");
      link.href = videoSrc;
      link.textContent = videoSrc;
      contentCell.push(link);
    }
    if (contentCell.length > 1) cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-collage.js
  function parse2(element, { document }) {
    const imageCells = Array.from(element.querySelectorAll('.image-cell, [class*="image-cell"]'));
    const cells = [];
    for (let i = 0; i < imageCells.length; i++) {
      const img = imageCells[i].querySelector("img");
      const itemCell = [];
      if (img) {
        itemCell.push(document.createComment(" field:image "));
        itemCell.push(img);
      } else {
        const p = document.createElement("p");
        p.textContent = imageCells[i].id || `image-cell-${i + 1}`;
        itemCell.push(document.createComment(" field:image "));
        itemCell.push(p);
      }
      cells.push([itemCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-collage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function parse3(element, { document }) {
    const cells = [];
    const halfTile = element.querySelector(".half-tile:not(.quarter-tile-container)");
    const col1 = [];
    if (halfTile) {
      const heading = halfTile.querySelector("h2");
      const desc = halfTile.querySelector(".description");
      col1.push(document.createComment(" field:text "));
      if (heading) col1.push(heading);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        col1.push(p);
      }
    }
    const col2 = [];
    const bgContainer = element.querySelector(".quarter-tile.background-container .background");
    if (bgContainer) {
      const style = bgContainer.getAttribute("style") || "";
      const urlMatch = style.match(/url\(([^)]+)\)/);
      if (urlMatch) {
        const img = document.createElement("img");
        img.src = urlMatch[1].replace(/['"]/g, "");
        img.alt = "";
        col2.push(document.createComment(" field:image "));
        col2.push(img);
      }
    }
    const ctaTile = element.querySelector(".quarter-tile:not(.background-container):not(.quarter-tile-container)");
    if (ctaTile) {
      const ctaHeading = ctaTile.querySelector("h3");
      const ctaLink = ctaTile.querySelector("a.cta-link-parent, a[href]");
      if (ctaHeading) col2.push(ctaHeading);
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.href;
        const ctaText = ctaTile.querySelector(".cta-underline");
        link.textContent = ctaText ? ctaText.textContent.trim() : "Learn more";
        const p = document.createElement("p");
        p.append(link);
        col2.push(p);
      }
    }
    if (col1.length > 0 || col2.length > 0) {
      cells.push([col1, col2]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse4(element, { document }) {
    const cells = [];
    const col1 = [];
    const bgDiv = element.querySelector(".background-container .background");
    if (bgDiv) {
      const style = bgDiv.getAttribute("style") || "";
      const urlMatch = style.match(/url\(([^)]+)\)/);
      if (urlMatch) {
        const img = document.createElement("img");
        img.src = urlMatch[1].replace(/['"]/g, "");
        img.alt = "";
        col1.push(document.createComment(" field:image "));
        col1.push(img);
      }
    }
    const col2 = [];
    const textContainer = element.querySelector(".text-container");
    if (textContainer) {
      col2.push(document.createComment(" field:text "));
      const heading = textContainer.querySelector("h2");
      if (heading) col2.push(heading);
      const desc = textContainer.querySelector(".description");
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        col2.push(p);
      }
      const ctaLink = textContainer.querySelector("a.cta-link, a[href]");
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.href;
        const ctaText = textContainer.querySelector(".cta-underline");
        link.textContent = ctaText ? ctaText.textContent.trim() : ctaLink.textContent.trim();
        const p = document.createElement("p");
        p.append(link);
        col2.push(p);
      }
    }
    if (col1.length > 0 || col2.length > 0) {
      cells.push([col1, col2]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-news.js
  function parse5(element, { document }) {
    const slides = Array.from(
      element.querySelectorAll('.splide__list > .splide__slide, .splide__list > div[role="tabpanel"]')
    );
    const cells = [];
    slides.forEach((slide) => {
      const imageCell = [];
      const img = slide.querySelector(".image-container img, img.img-fluid, img");
      if (img) {
        imageCell.push(document.createComment(" field:image "));
        imageCell.push(img);
      }
      const contentCell = [];
      const date = slide.querySelector("p.date, .date");
      const headline = slide.querySelector("h4.slide-header, h4, h3");
      const articleLink = slide.querySelector("a.cta-link-parent, a[href]");
      if (date || headline || articleLink) {
        contentCell.push(document.createComment(" field:text "));
      }
      if (date) contentCell.push(date);
      if (headline) contentCell.push(headline);
      if (articleLink) {
        const link = document.createElement("a");
        link.href = articleLink.href;
        const ctaText = slide.querySelector(".cta-underline");
        link.textContent = ctaText ? ctaText.textContent.trim() : "Read article";
        contentCell.push(link);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/chevron-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [".splide__slide--clone"]);
      WebImporter.DOMUtils.remove(element, [
        ".splide__pagination",
        ".splide__arrows",
        ".pause-container",
        ".control"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#ot-sdk-cookie-policy",
        '[class*="onetrust"]',
        '[id*="onetrust"]',
        '[id*="ot-sdk"]'
      ]);
      const skipLinks = element.querySelectorAll('a[href="#main-content"], a[href="#top"]');
      skipLinks.forEach((link) => {
        const parent = link.parentElement;
        if (parent && parent.tagName === "P" && parent.children.length === 1) {
          parent.remove();
        } else {
          link.remove();
        }
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, ["header", "footer", "nav"]);
      WebImporter.DOMUtils.remove(element, ["div.a13.modal"]);
      WebImporter.DOMUtils.remove(element, ["noscript", "link", "iframe"]);
      element.querySelectorAll('img[src*="t.co/"], img[src*="analytics.twitter.com"], img[src*="cdn.cookielaw.org"]').forEach((img) => {
        const parent = img.parentElement;
        img.remove();
        if (parent && parent.tagName === "P" && parent.children.length === 0 && !parent.textContent.trim()) {
          parent.remove();
        }
      });
      element.querySelectorAll("[data-cvx-first-module-no-adjustment], [data-cvx-module-name], [data-cvx-media-desktop], [data-cvx-media-mobile], [data-cvx-video-index], [data-cvx-first-module-exclude]").forEach((el) => {
        el.removeAttribute("data-cvx-first-module-no-adjustment");
        el.removeAttribute("data-cvx-module-name");
        el.removeAttribute("data-cvx-media-desktop");
        el.removeAttribute("data-cvx-media-mobile");
        el.removeAttribute("data-cvx-video-index");
        el.removeAttribute("data-cvx-first-module-exclude");
      });
    }
  }

  // tools/importer/transformers/chevron-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
      const doc = element.ownerDocument || document;
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-section-landing.js
  var PAGE_TEMPLATE = {
    name: "section-landing",
    description: "Top-level section landing page with hero, content sections, and CTAs for major Chevron divisions",
    urls: [
      "https://www.chevron.com/who-we-are",
      "https://www.chevron.com/what-we-do",
      "https://www.chevron.com/sustainability",
      "https://www.chevron.com/investors",
      "https://www.chevron.com/newsroom"
    ],
    blocks: [
      {
        name: "hero-video",
        instances: ["div.c74"]
      },
      {
        name: "columns-collage",
        instances: ["div.c72 .small-layout-container"]
      },
      {
        name: "cards-tile",
        instances: ["div.c64"]
      },
      {
        name: "columns-feature",
        instances: ["div.c69"]
      },
      {
        name: "carousel-news",
        instances: ["div.c57 section.splide"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Video",
        selector: "div.c74",
        style: "dark-gray",
        blocks: ["hero-video"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Belief Statement + Mosaic",
        selector: "div.c06r[class*='background-color-dark-blue']",
        style: "dark-blue",
        blocks: ["columns-collage"],
        defaultContent: ["div.c06r h2.type-display", "div.c06r .description", "div.c06r a.cta-button"]
      },
      {
        id: "section-3",
        name: "Feature Tiles",
        selector: "div.c64:first-of-type",
        style: null,
        blocks: ["cards-tile"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "History",
        selector: "div.c06r[class*='background-color-dark-green']",
        style: "dark-green",
        blocks: [],
        defaultContent: ["div.c06r h2.type-display", "div.c06r .description", "div.c06r a.cta-button", "div.c17e img"]
      },
      {
        id: "section-5",
        name: "Quality + Feature Links",
        selector: "div.c06r[class*='background-color-white']",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: ["div.c06r h2.type-display", "div.c06r .description"]
      },
      {
        id: "section-6",
        name: "News Carousel",
        selector: "div.c57",
        style: null,
        blocks: ["carousel-news"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "Newsletter Banner",
        selector: "div.c60",
        style: "dark-blue",
        blocks: [],
        defaultContent: ["div.c60 h2", "div.c60 a"]
      }
    ]
  };
  var parsers = {
    "hero-video": parse,
    "columns-collage": parse2,
    "cards-tile": parse3,
    "columns-feature": parse4,
    "carousel-news": parse5
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_section_landing_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_section_landing_exports);
})();
