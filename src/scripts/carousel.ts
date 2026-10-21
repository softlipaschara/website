function setupCarousel(carousel: HTMLElement): void {
  const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
  if (slides.length < 2) {
    return;
  }

  let index = 0;

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'carousel-arrow carousel-prev';
  previous.setAttribute('aria-label', 'Previous slide');
  previous.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-arrow carousel-next';
  next.setAttribute('aria-label', 'Next slide');
  next.textContent = '›';

  carousel.append(previous, next);

  const show = (nextIndex: number): void => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
  };

  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));

  let startX = 0;
  carousel.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });
  carousel.addEventListener('pointerup', (event) => {
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 40) {
      show(index + (delta < 0 ? 1 : -1));
    }
  });

  show(0);
}

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(setupCarousel);
