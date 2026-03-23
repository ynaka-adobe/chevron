export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  let hasAnimatedContent = false;

  const headings = block.querySelectorAll('h2, h1');
  const phrases = [];
  const phraseHeadings = [];
  headings.forEach((h) => {
    const text = h.textContent.trim();
    if (!text || text.length > 60) return;
    const parts = text.split(/\s*[,|]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      phrases.push(...parts);
      phraseHeadings.push(h);
    } else if (parts.length === 1 && /^[\w\s]+$/.test(parts[0])) {
      phrases.push(parts[0]);
      phraseHeadings.push(h);
    }
  });
  if (phrases.length > 0 && phraseHeadings.length > 0) {
    const marqueeWrap = document.createElement('div');
    marqueeWrap.className = 'hero-marquee-text-track';
    phrases.forEach((phrase, i) => {
      const span = document.createElement('span');
      span.className = `hero-marquee-phrase hero-marquee-phrase-${i % 2 === 0 ? 'rtl' : 'ltr'}`;
      span.textContent = phrase;
      marqueeWrap.appendChild(span);
    });
    phraseHeadings[0].replaceWith(marqueeWrap);
    phraseHeadings.slice(1).forEach((h) => h.remove());
    hasAnimatedContent = true;
  }

  const floatingImgs = block.querySelectorAll('p img');
  if (floatingImgs.length > 0) {
    const imgsWrap = document.createElement('div');
    imgsWrap.className = 'hero-marquee-floating-images';
    floatingImgs.forEach((img, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'hero-marquee-floating-image';
      const clone = img.cloneNode(true);
      wrapper.appendChild(clone);
      imgsWrap.appendChild(wrapper);
      img.closest('p')?.remove();
    });
    block.append(imgsWrap);
    hasAnimatedContent = true;
  }

  if (hasAnimatedContent) {
    block.classList.add('hero-marquee-animated');
    initScrollAnimation(block);
  }

  const contentRow = block.querySelector(':scope > div:has(.hero-marquee-text-track), :scope > div:has(p, h1, h2, h3, h4, h5, h6)');
  if (contentRow && !contentRow.classList.contains('hero-marquee-floating-images')) {
    contentRow.classList.add('hero-marquee-row-2');
  }
}

function initScrollAnimation(block) {
  const phrases = block.querySelectorAll('.hero-marquee-phrase');
  if (!phrases.length) return;

  const holdUntil = 0.05;

  function updateTransforms() {
    const rect = block.getBoundingClientRect();
    const vh = window.innerHeight;
    const blockTop = rect.top;
    const blockHeight = rect.height;

    const scrollRange = vh + blockHeight;
    const scrolled = vh - blockTop;
    const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

    let animProgress = 0;
    if (progress > holdUntil) {
      animProgress = (progress - holdUntil) / (1 - holdUntil);
    }

    phrases.forEach((phrase) => {
      const isRtl = phrase.classList.contains('hero-marquee-phrase-rtl');
      const x = isRtl ? (100 - animProgress * 200) : (-100 + animProgress * 200);
      phrase.style.transform = `translateX(${x}vw)`;
    });
  }

  const observer = new IntersectionObserver(
    () => { updateTransforms(); },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  observer.observe(block);

  window.addEventListener('scroll', updateTransforms, { passive: true });
  updateTransforms();
}

