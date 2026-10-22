import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://xinyue.de',
  build: { format: 'directory' },
  trailingSlash: 'always',
  integrations: [mdx()],
  devToolbar: { enabled: false },
  prerenderConflictBehavior: 'error',
  // Legacy .html paths are emitted as exact flat files by src/pages/[...legacy].ts.
  // Astro's redirects option would create directories for these paths.
});
