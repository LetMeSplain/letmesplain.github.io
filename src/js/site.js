/* LetMeSplain site behavior. Everything guided on this page is the REAL Splain
   free-tier bundle (vendor/splain.js + vendor/standalone.js) playing real guide
   payloads — the site demonstrates the product by being it.

   The theme demo works the way the product works: Splain's skin absorbs the
   host's design tokens (Filament-style RGB-triplet CSS variables + a `dark`
   class on <html>). The buttons below just re-dress the page; the engine does
   the absorbing. */

(() => {
    'use strict';

    // ── Themes: what a Filament host's :root variables look like ──────────
    const THEMES = {
        site: {
            brand: null, dark: true,
            vars: {
                '--primary-400': '244, 183, 100', '--primary-500': '240, 164, 65', '--primary-600': '199, 127, 31',
                '--gray-100': '236, 231, 221', '--gray-300': '154, 147, 139', '--gray-400': '154, 147, 139',
                '--gray-900': '36, 34, 41', '--gray-950': '27, 25, 30',
                '--demo-accent-ink': '244, 183, 100',
            },
        },
        saas: {
            brand: 'Northwind', dark: false,
            vars: {
                '--primary-400': '129, 140, 248', '--primary-500': '99, 102, 241', '--primary-600': '67, 56, 202',
                '--gray-100': '244, 244, 245', '--gray-300': '212, 212, 216', '--gray-400': '161, 161, 170',
                '--gray-900': '24, 24, 27', '--gray-950': '9, 9, 11',
                '--demo-bg': '250, 250, 250', '--demo-panel': '255, 255, 255', '--demo-ink': '24, 24, 27', '--demo-accent-ink': '67, 56, 202', '--demo-btn-ink': '255, 255, 255',
            },
        },
        logistics: {
            brand: 'Cargoline', dark: false,
            vars: {
                '--primary-400': '248, 113, 113', '--primary-500': '239, 68, 68', '--primary-600': '185, 28, 28',
                '--gray-100': '245, 245, 244', '--gray-300': '214, 211, 209', '--gray-400': '168, 162, 158',
                '--gray-900': '28, 25, 23', '--gray-950': '12, 10, 9',
                '--demo-bg': '250, 250, 249', '--demo-panel': '255, 255, 255', '--demo-ink': '28, 25, 23', '--demo-accent-ink': '185, 28, 28', '--demo-btn-ink': '255, 255, 255',
            },
        },
        fintech: {
            brand: 'Ledgerline', dark: true,
            vars: {
                '--primary-400': '52, 211, 153', '--primary-500': '16, 185, 129', '--primary-600': '4, 120, 87',
                '--gray-100': '226, 232, 240', '--gray-300': '148, 163, 184', '--gray-400': '148, 163, 184',
                '--gray-900': '15, 23, 42', '--gray-950': '2, 6, 23',
                '--demo-bg': '2, 6, 23', '--demo-panel': '15, 23, 42', '--demo-ink': '226, 232, 240', '--demo-accent-ink': '52, 211, 153', '--demo-btn-ink': '255, 255, 255',
            },
        },
    };

    const ALL_VARS = [...new Set(Object.values(THEMES).flatMap((theme) => Object.keys(theme.vars)))];

    function applyTheme(name) {
        const theme = THEMES[name] ?? THEMES.site;
        const root = document.documentElement;

        for (const key of ALL_VARS) {
            theme.vars[key] ? root.style.setProperty(key, theme.vars[key]) : root.style.removeProperty(key);
        }

        root.classList.toggle('dark', theme.dark);

        const brand = document.querySelector('[data-demo-brand]');
        if (brand && theme.brand) {
            const dot = document.createElement('span');
            dot.className = 'dot-i';
            dot.textContent = '.';
            brand.replaceChildren(theme.brand, dot);
        }

        document.querySelectorAll('.theme-btn').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.theme === name));
        });
    }

    // The site's own identity is a theme like any other — the field manual.
    applyTheme('site');

    document.querySelectorAll('.theme-btn').forEach((button) => {
        button.addEventListener('click', () => applyTheme(button.dataset.theme));
    });

    // ── The guides: real payloads for the real engine ─────────────────────
    // The adapter seam a Filament host uses for host-native buttons — here the
    // strings read the SAME absorption vars, so the demo's Next button changes
    // clothes with the theme too.
    const UI = {
        nextButtonStyle: 'background: rgb(var(--primary-500)); color: rgb(var(--demo-btn-ink, 27, 25, 30)); border: 0; border-radius: 0.45rem; padding: 0.45rem 0.9rem; font-weight: 650; text-shadow: none;',
        prevButtonStyle: 'background: transparent; color: rgb(var(--gray-300)); border: 1px solid rgba(var(--gray-300), 0.35); border-radius: 0.45rem; padding: 0.45rem 0.9rem; text-shadow: none;',
    };

    const siteTour = {
        slug: 'tour-this-site', title: 'Tour this site', genre: 'walkthrough', version: 1,
        steps: [
            { key: 'hello', kind: 'instruction', playback: 'direct', title: 'This is Splain',
              instruction: 'This spotlight, this popover, this dot — the real playback engine, running on its own website. Every section eyebrow below is a live data-splain anchor, the product’s actual naming grammar.',
              selector: '[data-splain="hero"]', next: 'clothes' },
            { key: 'clothes', kind: 'instruction', playback: 'direct', title: 'It wears your clothes',
              instruction: 'After the tour: flip a theme and press “Play the walkthrough.” The popover you’re reading right now will re-dress itself from that app’s design tokens — the same absorption it does inside a Filament panel.',
              selector: '[data-splain="demo-app"]', popover_side: 'top', next: 'receipts' },
            { key: 'receipts', kind: 'instruction', playback: 'direct', title: 'Receipts, not promises',
              instruction: 'Every card here describes shipped, tested behavior — checked on every push across two PHP versions, two Filament majors, and three browser engines.',
              selector: '[data-splain="receipts"]', next: 'honest' },
            { key: 'honest', kind: 'instruction', playback: 'direct', title: 'The honest part',
              instruction: 'Splain states its own limits as a feature. If a claim on this site ever outruns the code, that’s a bug — report it like one.',
              selector: '[data-splain="honest-scope"]', next: 'start' },
            { key: 'start', kind: 'instruction', playback: 'direct', title: 'Where you’d start',
              instruction: 'The whole install is a composer require and three artisan commands — then splain:doctor tells you honestly whether everything is wired.',
              selector: '[data-splain="quickstart"]' },
        ],
    };

    const demoGuide = {
        slug: 'wear-your-clothes', title: 'The wears-your-clothes demo', genre: 'walkthrough', version: 1,
        steps: [
            { key: 'find', kind: 'instruction', playback: 'direct', title: 'Find the record',
              instruction: 'A guide meets users where they already are. Notice the popover: it’s wearing this app’s tokens — flip the theme mid-guide and watch it change clothes.',
              selector: '[data-splain="demo-search"]', next: 'scan' },
            { key: 'scan', kind: 'instruction', playback: 'direct', title: 'Read the table',
              instruction: 'Anchors are exact selectors on real elements — this table is data-splain="demo-table". When code removes an anchor a guide needs, the CI gate fails the build instead of letting the guide rot.',
              selector: '[data-splain="demo-table"]', next: 'act' },
            { key: 'act', kind: 'instruction', playback: 'direct', title: 'Take the action',
              instruction: 'In a real host, Splain waits for the user to actually do this — the guide advances on the click, and a cancelled dialog doesn’t fool it.',
              selector: '[data-splain="demo-new"]' },
        ],
    };

    SplainStandalone.mount({
        progress: { enabled: false },
        ui: UI,
        guides: [siteTour, demoGuide],
    });

    // ── Wiring ─────────────────────────────────────────────────────────────
    const startButton = document.querySelector('[data-tour-start]');
    startButton?.addEventListener('click', () => {
        applyTheme('site');           // the site tour wears the field manual
        window.Splain.start(siteTour);
    });

    const demoButton = document.querySelector('[data-demo-start]');
    demoButton?.addEventListener('click', () => {
        const active = document.querySelector('.theme-btn[aria-pressed="true"]');
        applyTheme(active?.dataset.theme ?? 'saas');   // demo wears the chosen host
        document.querySelector('[data-splain="demo-app"]')?.scrollIntoView({ block: 'center' });
        window.Splain.start(demoGuide);
    });
})();
