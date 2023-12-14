import fs from 'fs-extra';
import { Slug } from '../common/slug';
import { HTMLString } from '../common/types';
import { Exporter } from './export';

export interface TemplaterArgs {
    html: HTMLString;
    slug?: Slug;
    title?: string;
    file?: string;
}

export class Templater {
    exporter: Exporter;
    navs: Record<string, string> = {};

    constructor(exporter: Exporter) {
        this.exporter = exporter;
    }

    applyTemplate({ html, slug, title }: TemplaterArgs): HTMLString {
        const replacers: Record<string, string> = {};
        replacers.sidebar = this.generateSidebar(slug);
        replacers.categories = this.navs[slug.game];

        replacers.title = title;
        replacers.content = html;

        replacers.contentPreview = html.replaceAll(/<[^>]*>/g, '').slice(0, 200);
        if (replacers.contentPreview.length === 200) {
            replacers.contentPreview += '...';
        }

        replacers.icon =
            this.exporter.pageHandler.index[slug.game].meta.favicon ||
            this.exporter.pageHandler.index[slug.game].meta.icon;
        replacers.iconPNG =
            this.exporter.pageHandler.index[slug.game].meta.iconPNG ||
            this.exporter.pageHandler.index[slug.game].meta.icon;

        replacers.gameName = this.exporter.pageHandler.index[slug.game].meta.name;
        replacers.color = this.exporter.pageHandler.index[slug.game].meta.color;

        replacers.game = slug.game;

        replacers.commit = process.env.CF_PAGES_COMMIT_SHA || 'UNAVAILABLE';
        replacers.branch = process.env.CF_PAGES_BRANCH || 'UNAVAILABLE';

        // Read template HTML
        let res: HTMLString = fs.readFileSync('templates/main.html', 'utf8');

        // Replacing values from opts in HTML
        for (const [key, value] of Object.entries(replacers)) {
            res = res.replaceAll(`%${key.toUpperCase()}%`, value || '');
        }

        return res;
    }

    /**
     * Generates the sidebar HTML for a specific page
     * @param slug Slug to the page next to the sidebar
     * @returns HTML generated for the sidebar
     */
    generateSidebar(slug: Slug): HTMLString {
        const data = this.exporter.pageHandler.menu[slug.game][slug.category];

        if (!data) return;

        let str = '';
        for (const topic of data) {
            str += `<a href="/${topic.link}" class="topic">${topic.name}</a>`;

            str += `<div class="article-list">`;
            for (const article of data) {
                str += `<a href="/${article.link}" class="article">${article.name}</a>`;
            }
            str += `</div>`;
        }
        return str;
    }

    /**
     * Generates the top nav links for all pages
     */
    generateNav() {
        for (const game of this.exporter.pageHandler.games) {
            // For each of the game's categories, shove a link into the nav bar to it
            let str = '';
            for (const category of game.categories) {
                const link = category.redirect || `/${game.id}/${category.id}/${category.home}`;
                str += `<a href="${link}">${category.label}</a>`;
            }
            this.navs[game.id] = str;
        }
    }
}
