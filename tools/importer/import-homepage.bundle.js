var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slides = Array.from(
      element.querySelectorAll("ul.splide__list > li.splide__slide:not(.splide__slide--clone)")
    );
    const contentItems = Array.from(
      element.querySelectorAll("ul.content-list > li.list-item")
    );
    const cells = [];
    contentItems.forEach((item, index) => {
      const imageCell = [];
      if (slides[index]) {
        const img = slides[index].querySelector("img.img-fluid, img");
        const video = slides[index].querySelector("video[poster]");
        if (img) {
          imageCell.push(document.createComment(" field:image "));
          imageCell.push(img);
        } else if (video) {
          const posterSrc = video.getAttribute("poster");
          if (posterSrc) {
            const posterImg = document.createElement("img");
            posterImg.src = posterSrc;
            posterImg.alt = "";
            imageCell.push(document.createComment(" field:image "));
            imageCell.push(posterImg);
          }
        }
      }
      const contentCell = [];
      const heading = item.querySelector("h2.heading, h2, h1, h3");
      const description = item.querySelector(".description");
      const ctaLink = item.querySelector("a.cta-link");
      if (heading || description || ctaLink) {
        contentCell.push(document.createComment(" field:text "));
      }
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.href;
        const underline = ctaLink.querySelector(".cta-underline");
        link.textContent = underline ? underline.textContent.trim() : ctaLink.textContent.trim();
        contentCell.push(link);
      }
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-marquee.js
  function parse2(element, { document }) {
    const cells = [];
    const images = Array.from(element.querySelectorAll(".images-container img, .image img"));
    if (images.length > 0) {
      cells.push([document.createComment(" field:image "), images[0]]);
    }
    const contentCell = [];
    const eyebrow = element.querySelector("p.type-eyebrow");
    const heading = element.querySelector("h2.type-display, h2.heading");
    if (eyebrow || heading || images.length > 1) {
      contentCell.push(document.createComment(" field:text "));
    }
    if (eyebrow) contentCell.push(eyebrow);
    if (heading) {
      const words = Array.from(heading.querySelectorAll("span.text-animation"));
      if (words.length > 0) {
        const h2 = document.createElement("h2");
        h2.textContent = words.map((w) => w.textContent.trim()).join(", ");
        contentCell.push(h2);
      } else {
        contentCell.push(heading);
      }
    }
    for (let i = 1; i < images.length; i++) {
      contentCell.push(images[i]);
    }
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-marquee", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-collage.js
  function parse3(element, { document }) {
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

  // tools/importer/parsers/hero-video.js
  function parse4(element, { document }) {
    const cells = [];
    const video = element.querySelector("video[poster], video");
    const posterImg = element.querySelector("video img.img-fluid, video img");
    const standaloneImg = element.querySelector("img.img-fluid, img");
    if (posterImg) {
      cells.push([document.createComment(" field:image "), posterImg]);
    } else if (video && video.getAttribute("poster")) {
      const img = document.createElement("img");
      img.src = video.getAttribute("poster");
      img.alt = "Ambient video poster";
      cells.push([document.createComment(" field:image "), img]);
    } else if (standaloneImg) {
      cells.push([document.createComment(" field:image "), standaloneImg]);
    }
    const videoSrc = video ? (video.querySelector("source") || {}).src || video.getAttribute("src") : null;
    if (videoSrc) {
      const contentCell = [];
      contentCell.push(document.createComment(" field:text "));
      const link = document.createElement("a");
      link.href = videoSrc;
      link.textContent = videoSrc;
      contentCell.push(link);
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
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

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Chevron corporate homepage with hero carousel, featured content sections, image collage, ambient video, and news carousel",
    urls: [
      "https://www.chevron.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["div.c70.carousel-shared"]
      },
      {
        name: "hero-marquee",
        instances: ["div.text-marquee.background-color-dark-blue"]
      },
      {
        name: "columns-collage",
        instances: ["div.c72 .large-layout-container"]
      },
      {
        name: "hero-video",
        instances: ["div.c17e .media-container.video-container"]
      },
      {
        name: "carousel-news",
        instances: ["div.c57.carousel-shared section.splide"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Image Carousel",
        selector: "div.c70.carousel-shared",
        style: "dark-blue",
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Who We Are Text Marquee",
        selector: "div.text-marquee.background-color-dark-blue",
        style: "dark-blue",
        blocks: ["hero-marquee"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Mission Statement",
        selector: "div#mod_8cb55247.c85",
        style: "dark-blue",
        blocks: [],
        defaultContent: ["div#mod_8cb55247 .description.type-subhead", "div#mod_8cb55247 a.cta-button"]
      },
      {
        id: "section-4",
        name: "What We Do Intro",
        selector: "div#mod_5865131d.c06r",
        style: null,
        blocks: [],
        defaultContent: ["div#mod_5865131d p.type-eyebrow", "div#mod_5865131d h2.type-display", "div#mod_5865131d .description", "div#mod_5865131d a.cta-button"]
      },
      {
        id: "section-5",
        name: "Image Collage Grid",
        selector: "div#mod_d096fbc1.c72",
        style: null,
        blocks: ["columns-collage"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Ambient Video",
        selector: "div#mod_1fc0c06b.c17e",
        style: null,
        blocks: ["hero-video"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "People Who Power CTA",
        selector: "div#mod_24c3b03c.c06r",
        style: null,
        blocks: [],
        defaultContent: ["div#mod_24c3b03c h2.type-display", "div#mod_24c3b03c .description", "div#mod_24c3b03c a.cta-button"]
      },
      {
        id: "section-8",
        name: "Latest at Chevron News Carousel",
        selector: "div#mod_85834f74.c57",
        style: null,
        blocks: ["carousel-news"],
        defaultContent: ["div#mod_85834f74 .opening-content p.type-eyebrow", "div#mod_85834f74 .opening-content h3.type-header"]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "hero-marquee": parse2,
    "columns-collage": parse3,
    "hero-video": parse4,
    "carousel-news": parse5
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = {
      ...payload,
      template: PAGE_TEMPLATE
    };
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
  var import_homepage_default = {
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
        path: path || "/index",
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
