export const site = {
  title: 'Xinyue',
  url: 'https://xinyue.de',
  description: 'Portfolio of Xinyue Yang, interaction and product designer.',
};

export interface NavItem {
  id: string;
  titleId: string;
  label: string;
  href: string;
}

export const homeNavigation: NavItem[] = [
  { id: 'indexButton', titleId: 'indexTitle', label: 'Design', href: '#selectedWorks' },
  { id: 'aboutButton', titleId: 'aboutTitle', label: 'About', href: '#about' },
  { id: 'blogButton', titleId: 'blogTitle', label: 'Blog', href: '#blog' },
  { id: 'contactButton', titleId: 'contactTitle', label: 'Contact', href: '#contact' },
];

export const RESERVED_SITE_ROUTES = ['about', 'contact', 'design', 'paintings', 'poems'];

export const prototypeTitlePlaceholders = [
  '#Thermochromic Print',
  '#Moving Scale',
  '#Sensing Armband',
  '#Breathing Surface',
];
