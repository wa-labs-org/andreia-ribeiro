import type { APIRoute } from 'astro';

// robots.txt gerado a partir de `site` (astro.config.mjs), apontando para o sitemap.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('sitemap-index.xml', site).href;
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
