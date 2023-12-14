import { HTMLString, MenuTopic, MetaGame } from '../common/types';

export interface TemplaterArgs {
    metaGame: MetaGame;
    html: HTMLString;
    title?: string;
    menuTopics?: MenuTopic[];
}

export class Templater {
    navs: Record<string, string> = {};
    templateContent: HTMLString;

    constructor(templateContent: HTMLString) {
        this.templateContent = templateContent;
    }

    applyTemplate({ metaGame, html, title, menuTopics }: TemplaterArgs): HTMLString {
        const replacers: Record<string, string> = {};
        replacers.sidebar = this.generateSidebar(menuTopics);
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
     * @param slug Slug to the page next to the sidebar
     * @returns HTML generated for the sidebar
     */
    generateSidebar(menuTopics: MenuTopic[]): HTMLString {
        if (!menuTopics) return;

        let str = '';
        for (const topic of menuTopics) {
            str += `<a href="/${topic.link}" class="topic">${topic.name}</a>`;

            str += `<div class="article-list">`;
            for (const article of topic.articles) {
                str += `<a href="/${article.link}" class="article">${article.name}</a>`;
            }
            str += `</div>`;
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
