function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

function videoishHref(href) {
  if (!href) return false;
  try {
    const { pathname } = new URL(href, window.location.href);
    return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(pathname);
  } catch {
    return false;
  }
}

/**
 * UE / DA hero-video model: video URL lives in row 2 as `p > a[href]`.
 * Chevron CDN links often omit a file extension — still treat as video for this block.
 */
function findVideoAnchor(bg, fg) {
  const fgParagraphLinks = [...(fg?.querySelectorAll('p > a[href]') ?? [])];
  if (fgParagraphLinks.length) {
    const withExt = fgParagraphLinks.find((a) => videoishHref(a.href));
    if (withExt) return { anchor: withExt, scope: 'fg' };
    /* Single link in a paragraph — canonical authoring shape for hero-video */
    if (fgParagraphLinks.length === 1) return { anchor: fgParagraphLinks[0], scope: 'fg' };
    const mediaLike = fgParagraphLinks.find((a) => {
      try {
        const h = new URL(a.href).hostname;
        return /akamai|cloudfront|brightcove|mediaplatform|chevron|verizon|edgekey/i.test(h);
      } catch {
        return false;
      }
    });
    if (mediaLike) return { anchor: mediaLike, scope: 'fg' };
  }

  const fgAny = [...(fg?.querySelectorAll('a[href]') ?? [])].filter((a) => videoishHref(a.href));
  if (fgAny[0]) return { anchor: fgAny[0], scope: 'fg' };

  const bgPic = bg?.querySelector('picture');
  const wrapInBg = bgPic?.closest('a[href*=".mp4"], a[href*=".webm"], a[href*=".m3u8"]');
  if (wrapInBg) return { anchor: wrapInBg, scope: 'bg' };

  const bgLink = bg?.querySelector('a[href*=".mp4"], a[href*=".webm"], a[href*=".m3u8"]')
    ?? bg?.querySelector('a[href]');
  if (bgLink && videoishHref(bgLink.href)) return { anchor: bgLink, scope: 'bg' };

  return null;
}

function mediaHostColumn(bg) {
  return bg.querySelector(':scope > div') ?? bg;
}

function removeVideoLinkFromDom(anchor, scope) {
  if (!anchor?.isConnected) return;
  if (scope === 'fg') {
    // Walk up to the nearest block-level wrapper (p or div) and remove it
    // if the anchor is the only meaningful content inside it.
    const wrapper = anchor.closest('p, div:not(.hero-foreground):not(.hero-video)');
    if (wrapper && wrapper.querySelectorAll('a').length === 1) {
      const remaining = wrapper.textContent.replace(anchor.textContent, '').trim();
      // Remove if nothing remains, or only stray chars from a split URL (e.g. "4" from ".mp4")
      if (!remaining || remaining.length <= 5) {
        wrapper.remove();
        return;
      }
    }
  }
  anchor.remove();
}

function startBackgroundVideo(video, bgPic) {
  const detachPoster = () => {
    if (bgPic?.isConnected) bgPic.remove();
  };

  const tryPlay = () => {
    video.play().catch(() => {});
  };

  tryPlay();
  video.addEventListener('playing', detachPoster, { once: true });
  video.addEventListener('canplay', () => {
    tryPlay();
    detachPoster();
  }, { once: true });
  video.addEventListener('loadeddata', () => {
    tryPlay();
    if (video.readyState >= 2) detachPoster();
  });

  video.addEventListener('error', () => {
    /* Keep poster visible if load fails */
  }, { once: true });
}

/* Pause SVG icon */
const PAUSE_ICON = `<svg class="btn-icon" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
  <rect x="2" y="1" width="3.5" height="12" rx="1"/>
  <rect x="8.5" y="1" width="3.5" height="12" rx="1"/>
</svg>`;

/* Play SVG icon */
const PLAY_ICON = `<svg class="btn-icon" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
  <path d="M2 1.5l10 5.5-10 5.5z"/>
</svg>`;

function addPlayPauseButton(hero, video) {
  const controls = document.createElement('div');
  controls.className = 'hero-video-controls';

  const btn = document.createElement('button');
  btn.className = 'play-pause-btn';
  btn.setAttribute('aria-label', 'Pause video');
  btn.innerHTML = `${PAUSE_ICON}<span>Pause</span>`;

  btn.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
      btn.setAttribute('aria-label', 'Pause video');
      btn.innerHTML = `${PAUSE_ICON}<span>Pause</span>`;
    } else {
      video.pause();
      btn.setAttribute('aria-label', 'Play video');
      btn.innerHTML = `${PLAY_ICON}<span>Play</span>`;
    }
  });

  controls.append(btn);
  hero.append(controls);
}

function mountVideoInBackground(bg, fg) {
  const bgPic = bg.querySelector('picture');
  const img = bgPic?.querySelector('img');
  if (img) setBackgroundFocus(img);

  const found = findVideoAnchor(bg, fg);
  if (!found) return null;

  const { anchor: vidLink, scope } = found;
  if (!vidLink?.href) return null;

  const video = document.createElement('video');
  video.src = vidLink.href;
  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.inert = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('preload', 'auto');
  if (img) {
    const poster = img.currentSrc || img.src;
    if (poster) video.poster = poster;
  }

  const col = mediaHostColumn(bg);

  if (scope === 'bg' && bgPic && (vidLink.contains(bgPic) || bgPic.closest('a') === vidLink)) {
    vidLink.parentElement.append(video, bgPic);
    vidLink.remove();
  } else if (bgPic && col.contains(bgPic)) {
    col.insertBefore(video, bgPic);
  } else {
    col.prepend(video);
  }

  video.load();
  startBackgroundVideo(video, bgPic);

  if (vidLink.isConnected) {
    removeVideoLinkFromDom(vidLink, scope);
  }

  return video;
}

/**
 * Same pattern as hero: row 1 = media, row 2 = text.
 * If authors used one row with two columns (media | text), split into two rows.
 */
function normalizeHeroVideoRows(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (rows.length !== 1) return;

  const [row] = rows;
  const cols = [...row.querySelectorAll(':scope > div')];
  if (cols.length < 2) return;

  const bgRow = document.createElement('div');
  bgRow.append(cols[0]);
  const fgRow = document.createElement('div');
  cols.slice(1).forEach((c) => fgRow.append(c));
  block.insertBefore(bgRow, row);
  block.insertBefore(fgRow, row);
  row.remove();
}

function decorateForeground(fg) {
  const root = fg.closest('.hero');
  const cols = [...fg.children];

  // Find the column with the heading — this becomes the main fg-text container.
  const headingCol = cols.find((c) => c.querySelector('h1, h2, h3, h4, h5, h6'));

  for (const col of cols) {
    const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      heading.classList.add('hero-heading');
      const detail = heading.previousElementSibling;
      if (detail) detail.classList.add('hero-detail');
      col.classList.add('fg-text');
      root.classList.add('hero-text-start');
    } else if (headingCol && col !== headingCol && !col.querySelector('a[href]') && col.textContent.trim()) {
      // Plain-text column (e.g. description): wrap its content in a <p> if needed
      // and move it into the heading column so it renders inside the white box.
      if (!col.querySelector('p')) {
        const p = document.createElement('p');
        p.textContent = col.textContent;
        col.replaceChildren(p);
      }
      headingCol.append(...col.childNodes);
      col.remove();
    }
  }

  root.classList.add('center');
}

export default function decorate(block) {
  document.body.classList.add('has-hero', 'has-hero-video');
  normalizeHeroVideoRows(block);

  block.classList.add('hero', 'full', 'dark');

  const rows = [...block.querySelectorAll(':scope > div')];
  if (rows.length >= 2) {
    const fg = rows.pop();
    const bg = rows.pop();
    fg.classList.add('hero-foreground');
    decorateForeground(fg);
    bg.classList.add('hero-background');
    const video = mountVideoInBackground(bg, fg);
    if (video) addPlayPauseButton(block, video);
    return;
  }

  if (rows.length === 1) {
    const bg = rows[0];
    bg.classList.add('hero-background');
    const video = mountVideoInBackground(bg, null);
    if (video) addPlayPauseButton(block, video);
  }

  if (!block.querySelector('picture, img, .hero-background video')) {
    block.classList.add('no-image');
  }
}
