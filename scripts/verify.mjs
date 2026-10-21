import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 4321);
const BASE_URL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR ?? '/tmp/portfolio-screenshots';
const REPORT_PATH = path.join(ROOT, 'docs/media-r2-migration/verification-report.json');

const defaultRoutes = [
  '/',
  '/about/',
  '/contact/',
  '/design/',
  '/paintings/',
  '/poems/',
  '/breathing-surface/',
  '/breeze/',
  '/canny-edge-detection/',
  '/coffee-composer/',
  '/emotional-tail/',
  '/ink-animation/',
  '/jie/',
  '/omzug/',
  '/painting/',
  '/photography/',
  '/printing/',
  '/responsive-lighting/',
  '/scale/',
  '/scribbling-speech/',
  '/sensing-armband/',
  '/soft-robotic/',
  '/termochromic/',
  '/the-body-languages-of-machine/',
  '/throw-it/',
  '/web/',
  '/word-to-world/',
];

const defaultWidths = [320, 375, 390, 414, 640, 768, 900, 1024, 1200, 1280, 1440, 1920];
const routes = process.env.ROUTES
  ? process.env.ROUTES.split(',').map((route) => route.trim()).filter(Boolean)
  : defaultRoutes;
const widths = process.env.WIDTHS
  ? process.env.WIDTHS.split(',').map((width) => Number(width.trim())).filter(Boolean)
  : defaultWidths;
const captureScreenshots = process.env.SCREENSHOTS !== '0';
const homeHashes = ['', '#selectedWorks', '#about', '#blog', '#contact'];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

function resolveRequest(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const candidate = path.join(DIST, clean);

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, 'index.html');
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }
  if (fs.existsSync(`${candidate}.html`)) {
    return `${candidate}.html`;
  }
  if (fs.existsSync(path.join(candidate, 'index.html'))) {
    return path.join(candidate, 'index.html');
  }
  return null;
}

const server = http.createServer((request, response) => {
  const file = resolveRequest(request.url ?? '/');
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  const extension = path.extname(file).toLowerCase();
  const headers = {
    'Content-Type': mimeTypes[extension] ?? 'application/octet-stream',
  };
  const stats = fs.statSync(file);
  headers['Content-Length'] = stats.size;

  if (request.method === 'HEAD') {
    response.writeHead(200, headers);
    response.end();
    return;
  }

  response.writeHead(200, headers);
  fs.createReadStream(file).pipe(response);
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const overflows = [];
const errors = [];
const screenshots = [];

for (const width of widths) {
  for (const route of routes) {
    const hashes = route === '/' ? homeHashes : [''];
    for (const hash of hashes) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(`${route}${hash}: ${error.message}`));
      await page.goto(`${BASE_URL}${route}${hash}`, { waitUntil: 'load' });
      await page.waitForTimeout(100);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (metrics.scrollWidth > metrics.innerWidth + 1) {
        overflows.push({ route, hash, width, ...metrics });
      }
      await context.close();
    }
  }
  console.log(`checked width ${width}`);
}

if (captureScreenshots) {
  for (const width of [1200, 1440]) {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const name = route === '/' ? 'home' : route.replaceAll('/', '') || 'home';
      const file = path.join(SCREENSHOT_DIR, `${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      screenshots.push(file);
      await context.close();
    }
    console.log(`captured width ${width}`);
  }
}

await browser.close();
await new Promise((resolve) => server.close(resolve));

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  overflows,
  errors,
  screenshots,
};

fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Overflows: ${overflows.length}`);
for (const overflow of overflows) {
  console.log(
    `${overflow.width}px ${overflow.route}${overflow.hash} scrollWidth=${overflow.scrollWidth}`,
  );
}
console.log(`Page errors: ${errors.length}`);
for (const error of errors) {
  console.log(error);
}

if (overflows.length > 0 || errors.length > 0) {
  process.exitCode = 1;
}
