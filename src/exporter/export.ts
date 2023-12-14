import fs from 'fs-extra';

import { PageHandler } from './pages';
import { Templater } from './template';
import { Slug } from '../common/slug';
import { MetaGame, Article, HTMLString } from '../common/types';

export class Exporter {
    pageHandler: PageHandler;
    games: MetaGame[];

    constructor() {
        this.pageHandler = new PageHandler();
    }

    export() {
        let stepCount = 1;
        const step = (): void => {
            console.log(`--------------`);
            console.log(`    Step ${stepCount++}`);
            console.log(`--------------`);
        };

        const startTime = performance.now();

        step();
        this.clean();
        this.copyAssets();
        this.copyResources();

        step();
        this.findGameMeta();
        this.copyGameMeta();

        step();
        this.pageHandler.buildIndex(this.games);
        fs.writeFileSync('public/ajax/menu.json', JSON.stringify(this.pageHandler.menu));

        step();
        this.saveAllPages();

        const endTime = performance.now();

        console.log('Done!');
        console.log('Building took', Math.ceil(endTime - startTime) / 1000, 'seconds.');
    }

    clean() {
        console.log('Clearing public folder...');
        if (fs.existsSync('public')) {
            fs.rmSync('public', { recursive: true });
        }
        fs.mkdirSync('public');
        fs.mkdirSync('public/ajax');
    }

    copyAssets() {
        console.log('Copying assets...');
        fs.mkdirSync('public/assets');
        fs.copySync('../assets', 'public/assets');
    }

    copyResources() {
        console.log('Copying resources...');
        fs.copySync('static', 'public');
    }

    findGameMeta() {
        // Read the pages folder, anything with a meta.json is a "game"
        this.games = fs
            .readdirSync('../pages')
            .filter((game) => fs.existsSync(`../pages/${game}/meta.json`))
            .map(
                (game) =>
                    ({
                        ...fs.readJSONSync(`../pages/${game}/meta.json`),
                        id: game
                    } as MetaGame)
            );
    }

    copyGameMeta() {
        // Copy over the game meta data
        const games = {};
        for (const game of this.games) games[game.id] = game;
        fs.writeFileSync('public/ajax/games.json', JSON.stringify(games));
    }

    /**
     * Saves an article to the right directories
     * @param templater The target template
     * @param metaGame The game meta data
     * @param article The article
     */
    savePage(templater: Templater, metaGame: MetaGame, article: Article): void {
        const slug = article.slug.toString();

        // Write article JSON meta to file
        fs.writeFileSync('public/ajax/article/' + slug + '.json', JSON.stringify(article.page));

        // Generate HTML content
        const content = templater.applyTemplate({
            metaGame: metaGame,
            html: article.page.content,
            title: article.page.meta.title || article.id,
            menuTopics: this.pageHandler.menu[metaGame.id][article.slug.category]
        });

        // Writing HTML to file
        fs.writeFileSync('public/' + slug + '.html', content);
    }

    saveAllPages() {
        // Create the file tree ahead of time
        for (const game of this.games) {
            for (const category of game.categories) {
                if (category.redirect) continue;
                for (const topic of category.topics) {
                    const path = game.id + '/' + category.id + '/' + topic.id;
                    fs.mkdirSync('public/' + path, { recursive: true });
                    fs.mkdirSync('public/ajax/article/' + path, { recursive: true });
                }
            }
        }

        // Read template HTML
        const templateMain: HTMLString = fs.readFileSync('templates/main.html', 'utf8');
        const template404: HTMLString = fs.readFileSync('templates/404.html', 'utf8');

        // Create the templater for articles
        const templater = new Templater(templateMain);

        // Apply templates for all pages
        for (const game of this.games) {
            // Generate the nav bar links
            templater.generateNav(game);

            // Save the Home page
            const content = this.pageHandler.articleCache[game.id]['index'];
            content.meta.title = 'Home';
            this.savePage(templater, game, {
                id: 'index',
                slug: new Slug(game.id, null, null, 'index'),
                page: content
            });

            // Save the 404 page
            this.savePage(templater, game, {
                id: '404',
                slug: new Slug(game.id, null, null, '404'),
                page: { content: template404, meta: { title: '404' }, path: '' }
            });

            // Save all articles
            for (const article of this.pageHandler.gameArticles[game.id]) {
                this.savePage(templater, game, article);
            }
        }
    }
}
