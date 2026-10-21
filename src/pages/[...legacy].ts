import type { APIRoute, GetStaticPaths } from 'astro';
import { legacyRoutes } from '../data/legacy';

export const prerender = true;

interface LegacyProps {
  target: string;
}

export const getStaticPaths = (() =>
  Object.entries(legacyRoutes).map(([legacyPath, target]) => ({
    params: { legacy: legacyPath.replace(/^\//, '') },
    props: { target },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<LegacyProps> = ({ props, site }) => {
  const { target } = props;
  const canonical = new URL(target, site ?? 'https://xinyue.de').href;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${target}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<title>Redirecting...</title>
</head>
<body>
<p>Redirecting to <a href="${target}">${target}</a>.</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
