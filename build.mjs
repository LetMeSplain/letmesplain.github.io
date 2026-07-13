// Static build: copy src/ verbatim, render content/docs/*.md into the docs shell.
// No framework, no client-side rendering — the identity is hand-authored and the
// docs are RENDERED from package markdown (synced by bin/sync-docs.sh), never forked.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import hljs from 'highlight.js';
import { Marked } from 'marked';

// Nav order IS information: the reading path a newcomer should take.
const PAGES = [
    ['index', 'Overview'],
    ['installation', 'Installation'],
    ['playback', 'Playback'],
    ['authoring', 'Authoring guides'],
    ['checking', 'splain:check'],
    ['privacy-mode', 'Privacy Mode'],
    ['studio', 'The Studio'],
    ['progress', 'Tracks & progress'],
    ['generation', 'Generation'],
    ['adapters', 'Adapters'],
    ['ci', 'CI & the drift gate'],
    ['schema', 'Guide schema'],
    ['changelog', 'Changelog'],
];

// Entities decode/strip FIRST: parseInline emits &#39; for apostrophes, which the
// character filter would otherwise mangle into ids like who39s-… (dead anchors).
const slugify = (text) => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[#a-z0-9]+;/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const marked = new Marked({
    gfm: true,
    renderer: {
        heading({ tokens, depth }) {
            const text = this.parser.parseInline(tokens);
            return `<h${depth} id="${slugify(text)}">${text}</h${depth}>\n`;
        },
        code({ text, lang }) {
            const language = lang && hljs.getLanguage(lang) ? lang : null;
            const body = language ? hljs.highlight(text, { language }).value : escapeHtml(text);
            return `<pre tabindex="0"><code class="hljs${language ? ` language-${language}` : ''}">${body}</code></pre>\n`;
        },
        link({ href, tokens }) {
            // Docs cross-link as installation.md → rewrite to the rendered page.
            const target = href.replace(/^(\.\/)?([a-z-]+)\.md(#.*)?$/, '$2.html$3');
            const external = /^https?:/.test(target) ? ' rel="noopener"' : '';
            return `<a href="${target}"${external}>${this.parser.parseInline(tokens)}</a>`;
        },
    },
});

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/docs', { recursive: true });

for (const entry of readdirSync('src')) {
    if (entry === 'templates') continue;
    cpSync(`src/${entry}`, `dist/${entry}`, { recursive: true });
}

const shell = readFileSync('src/templates/docs.html', 'utf8');

const SITE = 'https://letmesplain.dev';

for (const [slug, title] of PAGES) {
    const raw = readFileSync(`content/docs/${slug}.md`, 'utf8');

    // The sync header is provenance — surface it as the page's footer line.
    const syncedFrom = raw.match(/^<!-- synced from (splain@\w+) /);
    const provenance = syncedFrom ? `Rendered from <code>${syncedFrom[1]}</code>.` : '';

    const nav = PAGES.map(([navSlug, navTitle]) => {
        const current = navSlug === slug ? " aria-current='page'" : '';
        const href = navSlug === 'index' ? './' : `${navSlug}.html`;
        return `        <a href="${href}"${current}>${navTitle}</a>`;
    }).join('\n');

    const pageUrl = slug === 'index' ? `${SITE}/docs/` : `${SITE}/docs/${slug}.html`;
    const html = shell
        .replaceAll('{{ogUrl}}', pageUrl)
        .replaceAll('{{title}}', title)
        .replace('{{nav}}', nav)
        .replace('{{content}}', marked.parse(raw.replace(/^<!--[^>]*-->\n*/, '')))
        .replace('{{provenance}}', provenance);

    writeFileSync(`dist/docs/${slug === 'index' ? 'index' : slug}.html`, html);
}

// Crawl plumbing: the sitemap names every page; robots points at it.
const urls = [`${SITE}/`, `${SITE}/about.html`,
    ...PAGES.map(([slug]) => (slug === 'index' ? `${SITE}/docs/` : `${SITE}/docs/${slug}.html`))];
writeFileSync('dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
        urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`built ${PAGES.length} docs pages + sitemap/robots + static site into dist/`);
