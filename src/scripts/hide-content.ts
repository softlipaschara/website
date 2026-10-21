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

function showSection(section: Section): void {
  sections.forEach((id) => setDisplay(id, id === section ? 'block' : 'none'));

  const mask = document.getElementById('mask');
  if (mask) {
    mask.className = section === 'index' ? 'maskBlack' : 'maskWhite';
  }

  setDisplay('waterImage', section === 'contact' ? 'block' : 'none');
  setDisplay('besidesPart', section === 'about' ? 'block' : 'none');

  const activeClass = `${section}Active`;
  setActiveClass(activeClass);
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

detectHash();
window.addEventListener('hashchange', detectHash);
