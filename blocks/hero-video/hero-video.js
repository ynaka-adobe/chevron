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
    const p = anchor.closest('p');
    if (p && p.querySelectorAll('a').length === 1) {
      const t = p.textContent.trim();
      if (t === anchor.textContent.trim() || t === anchor.href || /^\s*https?:/i.test(t)) {
        p.remove();
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

function mountVideoInBackground(bg, fg) {
  const bgPic = bg.querySelector('picture');
  const img = bgPic?.querySelector('img');
  if (img) setBackgroundFocus(img);

  const found = findVideoAnchor(bg, fg);
  if (!found) return;

  const { anchor: vidLink, scope } = found;
  if (!vidLink?.href) return;

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
  const { children } = fg;
  const root = fg.closest('.hero');
  for (const [idx, child] of [...children].entries()) {
    const heading = child.querySelector('h1, h2, h3, h4, h5, h6');
    const text = heading || child.querySelector('p, a, ul');
    if (heading) {
      heading.classList.add('hero-heading');
      const detail = heading.previousElementSibling;
      if (detail) {
        detail.classList.add('hero-detail');
      }
    }
    if (text) {
      child.classList.add('fg-text');
      if (idx === 0) {
        root.classList.add('hero-text-start');
      } else {
        root.classList.add('hero-text-end');
      }
    }
  }
  root.classList.add('center');
}

export default function decorate(block) {
  normalizeHeroVideoRows(block);

  block.classList.add('hero', 'full', 'dark');

  const rows = [...block.querySelectorAll(':scope > div')];
  if (rows.length >= 2) {
    const fg = rows.pop();
    const bg = rows.pop();
    fg.classList.add('hero-foreground');
    decorateForeground(fg);
    bg.classList.add('hero-background');
    mountVideoInBackground(bg, fg);
    return;
  }

  if (rows.length === 1) {
    const bg = rows[0];
    bg.classList.add('hero-background');
    mountVideoInBackground(bg, null);
  }

  if (!block.querySelector('picture, img, .hero-background video')) {
    block.classList.add('no-image');
  }
}
