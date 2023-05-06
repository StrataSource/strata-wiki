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

        // Generate title
        replacers.title = title;
        replacers.content = html;

        replacers.game = slug.game;

        // Read template HTML
        let res: HTMLString = fs.readFileSync('templates/main.html', 'utf8');

        // Replacing values from opts in HTML
        for (const [key, value] of Object.entries(replacers)) {
            res = res.replaceAll(`%${key.toUpperCase()}%`, value);
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
        for (const entry of data) str += `<a href="/${entry.link}" class="${entry.type}">${entry.text}</a>`;
        return str;
    }

    /**
     * Generates the top nav links for all pages
     */
    generateNav() {
        for (const game of this.exporter.pageHandler.games) {
            let str = '';
            for (const category of game.categories)
                str += `<a href="/${game.id}/${category.id}/${category.home}">${category.label}</a>`;
            this.navs[game.id] = str;
        }
    }
}
