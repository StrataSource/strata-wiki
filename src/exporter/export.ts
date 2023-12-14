import fs from 'fs-extra';
import { PageHandler } from './pages';
import { Templater } from './template';
import { Renderer } from './render';
import { Slug } from '../common/slug';
import { MetaGame } from '../common/types';

export class Exporter {
    pageHandler: PageHandler;
    templater: Templater;
    renderer: Renderer;
    games: MetaGame[];

    constructor() {
        this.pageHandler = new PageHandler(this);
        this.templater = new Templater();
        this.renderer = new Renderer();

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

        // For each game, register up a handler for its game exclusive block
        for (const game of this.games) {
            this.renderer.registerGame(game.id, game.nameShort || game.name || game.id);
        }

        // For each game, cache all articles
        console.log('Caching articles...');
        for (const game of this.games) {
            this.pageHandler.cacheArticles(game.id);
        }
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

        step();
        this.copyAssets();

        step();
        this.copyResources();

        step();
        this.templater.generateNav(this.games);

        step();
        this.pageHandler.buildIndex(this.games);

        step();
        this.saveAllPages();

        step();
        this.generateSpecialPages();

        step();
        this.copyGameMeta();

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

    saveAllPages() {
        for (const gameMeta of this.games)
            for (const category of Object.values(this.pageHandler.index[gameMeta.id].categories))
                for (const topic of Object.values(category.topics))
                    for (const article of Object.values(topic.articles)) {
                        this.pageHandler.savePage(gameMeta, article);
                    }
    }

    copyGameMeta() {
        const games = {};
        for (const game of this.games) {
            games[game.id] = game;
        }

        fs.writeFileSync('public/ajax/games.json', JSON.stringify(games));
    }

    generateSpecialPages() {
        for (const game of this.games) {
            const content = this.renderer.renderPage(`../pages/${game.id}/index.md`);

            this.pageHandler.savePage(game, {
                ...content,
                slug: new Slug(game.id),
                name: content.meta.title || 'Home',
                file: `/pages/${game.id}/index.md`,
                id: 'index'
            });

            this.pageHandler.savePage(game, {
                ...content,
                slug: new Slug(game.id),
                name: 'Home',
                file: '',
                id: '404',
                content: fs.readFileSync('templates/404.html', 'utf8')
            });
        }
    }
}
