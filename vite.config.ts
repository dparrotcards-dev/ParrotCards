import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStructuredData, PAGE_SEO } from './src/seo/pageMetadata';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function routeSeoHtml() {
  return {
    name: 'route-seo-html',
    apply: 'build' as const,
    closeBundle: async () => {
      const outputDirectory = resolve(frontendRoot, 'dist');
      const template = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');

      for (const [path, page] of Object.entries(PAGE_SEO)) {
        const canonicalUrl = `https://kp52.in${path === '/' ? '/' : path}`;
        const metadata = new Map<string, string>([
          ['name:description', page.description],
          [
            'name:robots',
            page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
          ],
          ['property:og:type', 'website'],
          ['property:og:site_name', 'Parrot Cards'],
          ['property:og:title', page.title],
          ['property:og:description', page.description],
          ['property:og:url', canonicalUrl],
          ['property:og:image', 'https://kp52.in/store_hero_parrot.jpg'],
          ['property:og:image:alt', 'Parrot Cards personalized cosmic card experience'],
          ['name:twitter:card', 'summary_large_image'],
          ['name:twitter:title', page.title],
          ['name:twitter:description', page.description],
          ['name:twitter:image', 'https://kp52.in/store_hero_parrot.jpg'],
        ]);
        let html = template.replace(
          /<title>[\s\S]*?<\/title>/i,
          `<title>${escapeHtml(page.title)}</title>`,
        );
        html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
          const identity = tag.match(/\b(name|property)="([^"]+)"/i);
          if (!identity) return tag;
          const content = metadata.get(`${identity[1].toLowerCase()}:${identity[2]}`);
          return content === undefined
            ? tag
            : `<meta ${identity[1]}="${identity[2]}" content="${escapeHtml(content)}" />`;
        });
        html = html.replace(
          /<link\b[^>]*rel="canonical"[^>]*>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`,
        );
        html = html.replace(
          /<script type="application\/ld\+json" data-parrot-seo="structured-data">[\s\S]*?<\/script>/i,
          `<script type="application/ld+json" data-parrot-seo="structured-data">${JSON.stringify(createStructuredData(path, page))}</script>`,
        );

        const pageDirectory = path === '/' ? outputDirectory : resolve(outputDirectory, path.slice(1));
        await mkdir(pageDirectory, { recursive: true });
        await writeFile(resolve(pageDirectory, 'index.html'), html);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), routeSeoHtml()],
  server: {
    port: 5173,
    host: true,
  },
});
