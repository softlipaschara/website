const DEFAULT_MEDIA_BASE = 'https://media.xinyue.de';

const configuredMediaBase = import.meta.env.PUBLIC_MEDIA_BASE;
const mediaBase = (configuredMediaBase || DEFAULT_MEDIA_BASE).replace(/\/+$/, '');

export function mediaUrl(key: string): string {
  return `${mediaBase}/${key.replace(/^\/+/, '')}`;
}
