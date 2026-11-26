// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// endereço público do site: base do canonical, das URLs do Open Graph e do sitemap.
	// Trocar pelo domínio próprio quando ele existir (ex.: https://andreiaribeiroatelier.com.br).
	site: 'https://andreia-ribeiro-xi.vercel.app',
	integrations: [sitemap()],
});
