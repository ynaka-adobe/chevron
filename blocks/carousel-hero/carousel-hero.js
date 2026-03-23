import moveInstrumentation from '../../scripts/utils/instrumentation.js';

const ZOOM_DURATION_MS = 8000;

function clearAdvanceTimeout(block) {
  if (block._carouselAdvanceTimeout) {
    clearTimeout(block._carouselAdvanceTimeout);
    block._carouselAdvanceTimeout = null;
  }
}

function scheduleAdvance(block, delay) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (slides.length < 2) return;
  clearAdvanceTimeout(block);
  block._carouselAdvanceTimeout = setTimeout(() => {
    block._carouselAdvanceTimeout = null;
    const current = parseInt(block.dataset.activeSlide, 10);
    showSlide(block, current + 1);
  }, delay);
}

function decorateSlideMedia(slide) {
  const imageCol = slide.querySelector('.carousel-hero-slide-image');
  if (!imageCol) return;
  const picture = imageCol.querySelector('picture');
  const vidLink = picture?.closest('a[href*=".mp4"], a[href*=".webm"]')
    ?? imageCol.querySelector('a[href*=".mp4"], a[href*=".webm"]');
  if (vidLink) {
    const video = document.createElement('video');
    video.src = vidLink.href;
    video.loop = true;
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.dataset.carouselVideo = 'true';
    const img = picture?.querySelector('img') ?? vidLink.querySelector('img');
    if (img?.src) video.poster = img.src;
    video.load();
    vidLink.replaceWith(video);
    return;
  }
  if (picture) {
    imageCol.dataset.carouselImage = 'true';
    const slideIndex = parseInt(slide.dataset.slideIndex, 10);
    imageCol.dataset.carouselFocal = slideIndex % 2 === 0 ? 'left' : 'right';
  }
}

function startImageZoomWhenActive(slide) {
  const block = slide?.closest('.carousel-hero');
  const imageCol = slide?.querySelector('.carousel-hero-slide-image[data-carousel-image]');
  if (!imageCol || imageCol.dataset.carouselZoomStarted === 'true') return;
  const img = imageCol.querySelector('picture img');
  if (!img) return;

  const runZoom = () => {
    imageCol.dataset.carouselZoomStarted = 'true';
    imageCol.classList.add('carousel-hero-slide-image--zoomed');
    scheduleAdvance(block, ZOOM_DURATION_MS);
  };

  const startAfterLoad = () => setTimeout(runZoom, 500);

  if (img.complete) startAfterLoad();
  else img.addEventListener('load', startAfterLoad, { once: true });
}

function playActiveSlideVideo(block, activeSlide) {
  block.querySelectorAll('.carousel-hero-slide video[data-carousel-video]').forEach((v) => {
    v.pause();
  });
  const activeVideo = activeSlide?.querySelector('video[data-carousel-video]');
  if (activeVideo) {
    const onPlaying = () => {
      activeVideo.removeEventListener('playing', onPlaying);
      scheduleAdvance(block, ZOOM_DURATION_MS);
    };
    activeVideo.addEventListener('playing', onPlaying);
    activeVideo.play().catch(() => {});
  }
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  clearAdvanceTimeout(block);
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });

  playActiveSlideVideo(block, slide);
  startImageZoomWhenActive(slide);
}

export function showSlide(block, slideIndex = 0) {
  clearAdvanceTimeout(block);
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  block.dataset.activeSlide = realSlideIndex;
  playActiveSlideVideo(block, activeSlide);
  startImageZoomWhenActive(activeSlide);

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.classList.add('carousel-hero-slide-indicators-nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
    container.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    decorateSlideMedia(slide);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  } else {
    const singleSlide = slidesWrapper.querySelector('.carousel-hero-slide');
    playActiveSlideVideo(block, singleSlide);
    startImageZoomWhenActive(singleSlide);
  }
}
