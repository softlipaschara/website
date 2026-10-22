const backButtons = [...document.querySelectorAll<HTMLAnchorElement>('a[data-back-button]')];

for (const link of backButtons) {
  link.addEventListener('click', (event) => {
    if (window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
}

function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return null;
  }
  const parts = match[1].split(',').map((part) => Number(part.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}

function luminance(color: { r: number; g: number; b: number }): number {
  return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
}

function updateBackButton(link: HTMLAnchorElement) {
  const target =
    link.querySelector<HTMLElement>('.backButton, .backButtonText') ?? link;
  const bounds = target.getBoundingClientRect();
  const x = Math.max(0, Math.min(window.innerWidth - 1, bounds.left + bounds.width / 2));
  const y = Math.max(0, Math.min(window.innerHeight - 1, bounds.top + bounds.height / 2));
  const variant = link.dataset.backVariant === 'white' ? 'white' : 'black';
  let color: 'black' | 'white' = 'black';

  for (const element of document.elementsFromPoint(x, y)) {
    if (link.contains(element)) {
      continue;
    }

    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLVideoElement ||
      element instanceof HTMLPictureElement
    ) {
      color = variant;
      break;
    }

    const style = getComputedStyle(element);
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      color = variant;
      break;
    }

    const background = parseColor(style.backgroundColor);
    if (background && background.a > 0.1) {
      color = luminance(background) > 0.55 ? 'black' : 'white';
      break;
    }
  }

  link.classList.toggle('is-black', color === 'black');
  link.classList.toggle('is-white', color === 'white');
}

let scheduled = false;

function updateAll() {
  scheduled = false;
  for (const link of backButtons) {
    updateBackButton(link);
  }
}

function scheduleUpdate() {
  if (scheduled) {
    return;
  }
  scheduled = true;
  requestAnimationFrame(updateAll);
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('load', scheduleUpdate);
updateAll();
