import { MetaGame } from './types';
import { HTMLString, MenuCategory } from '../common/types';
import { Slug } from '../common/slug';

export interface TemplaterArgs {
    slug: Slug;
    metaGame: MetaGame;
    html: HTMLString;
    title?: string;
    menuCategory?: MenuCategory;
}

export class Templater {
    navs: Record<string, string> = {};
    templateContent: HTMLString;

    constructor(templateContent: HTMLString) {
        this.templateContent = templateContent;
    }

    applyTemplate({ slug, metaGame, html, title, menuCategory }: TemplaterArgs): HTMLString {
        const replacers: Record<string, string> = {};
        replacers.sidebar = this.generateSidebar(slug, menuCategory);
        replacers.categories = this.navs[metaGame.id];

        replacers.title = title;
        replacers.content = html;

        replacers.contentPreview = html.replaceAll(/<[^>]*>/g, '').slice(0, 200);
        if (replacers.contentPreview.length === 200) {
            replacers.contentPreview += '...';
        }

        replacers.icon = metaGame.favicon || metaGame.icon;
        replacers.iconPNG = metaGame.iconPNG || metaGame.icon;

        replacers.gameName = metaGame.name;
        replacers.color = metaGame.color;

        replacers.game = metaGame.id;

        replacers.commit = process.env.CF_PAGES_COMMIT_SHA || 'UNAVAILABLE';
        replacers.branch = process.env.CF_PAGES_BRANCH || 'UNAVAILABLE';

        // Read template HTML
        let res: HTMLString = this.templateContent;

        // Replacing values from opts in HTML
        for (const [key, value] of Object.entries(replacers)) {
            res = res.replaceAll(`%${key.toUpperCase()}%`, value || '');
        }

        return res;
    }

    /**
     * Generates the sidebar HTML for a specific page
     * @param basePath Slug to game/category/
     * @returns HTML generated for the sidebar
     */
    generateSidebar(basePath: Slug, menuCategory: MenuCategory): HTMLString {
        if (!menuCategory) return;

        const slug = basePath.clone();

        let str = '';
        for (const [topicID, topic] of Object.entries(menuCategory.topics)) {
            // Top level page is just the index
            slug.topic = topicID;
            slug.article = 'index';

            str += `<details>`;
            str += `<summary class="topic" id="sb-${topicID}">${topic.name}</summary>`;

            str += `<ul class="article-list">`;
            for (const [articleID, article] of Object.entries(topic.articles)) {
                slug.article = articleID;
                str += `<li><a href="/${slug.toString()}" class="article">${article.name}</a></li>`;
            }
            str += `</ul>`;

            str += `</details>`;
        }
        return str;
    }

    /**
     * Generates the top nav links for all pages
     * @param game Game metadata
     */
    generateNav(game: MetaGame) {
        // For each of the game's categories, shove a link into the nav bar to it
        let str = '';
        for (const category of game.categories) {
            const link = category.redirect || `/${game.id}/${category.id}/${category.home}`;
            str += `<a href="${link}">${category.label}</a>`;
        }
        this.navs[game.id] = str;
    }
}
