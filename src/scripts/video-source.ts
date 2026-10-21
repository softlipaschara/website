const SMALL_VIEWPORT = '(max-width: 900px)';

interface NetworkInformation {
  saveData?: boolean;
}

function selectSource(): void {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const prefersSmall = window.matchMedia(SMALL_VIEWPORT).matches || connection?.saveData === true;

  document.querySelectorAll<HTMLVideoElement>('video[data-src-720][data-src-480]').forEach((video) => {
    const source = prefersSmall ? video.dataset.src480 : video.dataset.src720;
    if (!source || video.getAttribute('src') === source) {
      return;
    }

    const wasPlaying = !video.paused;
    video.setAttribute('src', source);
    video.load();
    if (wasPlaying) {
      void video.play().catch(() => undefined);
    }
  });
}

selectSource();
window.matchMedia(SMALL_VIEWPORT).addEventListener('change', selectSource);
