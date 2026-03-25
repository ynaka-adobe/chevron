export default function decorate(block) {
  const picture = block.querySelector(':scope > div:first-child picture');
  const img = picture?.querySelector('img') ?? block.querySelector(':scope > div:first-child img');
  const vidLink = block.querySelector('a[href*=".mp4"], a[href*=".webm"]')
    ?? picture?.closest('a[href*=".mp4"], a[href*=".webm"]');

  if (vidLink?.href) {
    const video = document.createElement('video');
    video.src = vidLink.href;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    if (img?.src) video.poster = img.src;
    video.classList.add('hero-video-background');
    video.load();

    video.addEventListener('canplay', () => {
      video.play().catch(() => {});
      if (picture) picture.style.opacity = '0';
    }, { once: true });

    const wrapper = block.querySelector(':scope > div:first-child') ?? block;
    const linkWrapsPoster = vidLink.querySelector('img, picture');
    wrapper.prepend(video);

    if (!linkWrapsPoster) {
      const linkParent = vidLink.closest('p');
      if (linkParent && linkParent.textContent.trim() === vidLink.textContent.trim()) {
        linkParent.remove();
      } else {
        vidLink.remove();
      }
    }
  }

  if (!picture && !img) {
    block.classList.add('no-image');
  }
}
