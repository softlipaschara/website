const sections = ['index', 'about', 'contact', 'blog'] as const;

type Section = (typeof sections)[number];

const titles = ['indexTitle', 'aboutTitle', 'contactTitle', 'blogTitle'] as const;

function setDisplay(id: string, display: 'block' | 'none'): void {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = display;
  }
}

function setActiveClass(activeClass: string): void {
  titles.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.className = activeClass;
    }
  });
}

const header = document.getElementById('headerSticky');
const mask = document.getElementById('mask');
const SCROLL_THRESHOLD = 24;
let suppressShade = false;
let shadeReadyAt = 0;

function updateHeaderShade(): void {
  if (!header || !mask) {
    return;
  }
  if (suppressShade) {
    header.classList.remove('is-scrolled');
    return;
  }
  const isSubpage = mask.classList.contains('maskWhite');
  header.classList.toggle('is-scrolled', isSubpage && window.scrollY > SCROLL_THRESHOLD);
}

function showSection(section: Section): void {
  sections.forEach((id) => setDisplay(id, id === section ? 'block' : 'none'));

  if (mask) {
    mask.className = section === 'index' ? 'maskBlack' : 'maskWhite';
  }

  document.body.classList.toggle('contact-active', section === 'contact');
  document.body.classList.toggle('about-active', section === 'about');
  document.documentElement.classList.toggle('about-locked', section === 'about');
  if (section === 'about') {
    window.scrollTo(0, 0);
  }
  suppressShade = section !== 'index';
  shadeReadyAt = performance.now() + 350;
  if (header) {
    header.classList.remove('is-scrolled');
  }
  setDisplay('waterImage', section === 'contact' ? 'block' : 'none');
  setDisplay('besidesPart', section === 'about' ? 'block' : 'none');

  const activeClass = `${section}Active`;
  setActiveClass(activeClass);
  updateHeaderShade();
}

function detectHash(): void {
  switch (location.hash) {
    case '#about':
      showSection('about');
      break;
    case '#contact':
      showSection('contact');
      break;
    case '#blog':
      showSection('blog');
      break;
    default:
      showSection('index');
  }
}

function handleScroll(): void {
  if (suppressShade) {
    if (performance.now() < shadeReadyAt) {
      return;
    }
    suppressShade = false;
  }
  updateHeaderShade();
}

function handleUserScroll(): void {
  if (suppressShade) {
    suppressShade = false;
  }
  updateHeaderShade();
}

detectHash();
window.addEventListener('hashchange', detectHash);
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('wheel', handleUserScroll, { passive: true });
window.addEventListener('touchmove', handleUserScroll, { passive: true });
window.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home'].includes(event.key)) {
    handleUserScroll();
  }
});
window.addEventListener('resize', updateHeaderShade);
