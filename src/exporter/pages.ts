import fs from 'fs-extra';

import { Slug } from '../common/slug';
import { Article, MetaGame, Menu, MenuArticle, MenuTopic, RenderedPage } from '../common/types';
import { Renderer } from './render';

export class PageHandler {
    renderer: Renderer;

    menu: Menu;
    articleCache: { [path: string]: { [article: string]: RenderedPage } };
    gameArticles: { [game: string]: Article[] };

    constructor() {
        this.renderer = new Renderer();

        this.menu = {};
        this.articleCache = {};
        this.gameArticles = {};
    }

    /**
     * Finds all markdown files recursively and renders them
     */
    cacheArticles(topicDir: string): void {
        const basePath: string = '../pages/';
        console.log(`Searching for articles in "${topicDir}"`);

        this.articleCache[topicDir] = {};

        const topicPath = basePath + topicDir;
        const dirArticles = fs.readdirSync(topicPath, { withFileTypes: true });
        for (const dent of dirArticles) {
            if (dent.isDirectory()) {
                // Call recursively for directories
                this.cacheArticles(topicDir + '/' + dent.name);
                continue;
            }

            // Get the file extension, ignore non-markdown files, split off the extension
            const articleName = dent.name;
            const ext = articleName.lastIndexOf('.md');
            if (ext < articleName.length - 3) {
                continue;
            }
            const articleID = articleName.slice(0, ext);

            // Render and cache it!
            const result = this.renderer.renderPage(topicPath + '/' + articleName);
            this.articleCache[topicDir][articleID] = result;
        }
    }

    buildIndex(games: MetaGame[]): void {
        // For each game, register up a handler for its game exclusive block
        for (const game of games) {
            this.renderer.registerGame(game.id, game.nameShort || game.name || game.id);
        }

        // For each game, cache all articles
        console.log('Caching articles...');
        for (const game of games) {
            this.cacheArticles(game.id);
        }

        // For each game, for each category, for each topic, build a list of articles
        console.log('Building article index...');
        for (const game of games) {
            this.gameArticles[game.id] = [];
            this.menu[game.id] = {};

            for (const category of game.categories) {
                // If this category is just a redirect, we don't need to render any pages
                if (category.redirect) continue;

                // It's a normal category, so we'll need to fill in its topics
                const menuTopics: MenuTopic[] = [];
                this.menu[game.id][category.id] = menuTopics;
                for (const topic of category.topics) {
                    // If the topic lacks a specific path, we'll use its id
                    if (!topic.path) topic.path = topic.id;

                    // All articles on the topic
                    // Array of tuples of [article, page]
                    const articles: [string, RenderedPage][] = [];

                    // Search all possible paths for articles and build a list of every article we want
                    const possiblePaths = [`${game.id}/${topic.path}`, `shared/${topic.path}`];
                    for (const path of possiblePaths) {
                        // Skip topics not in the cache
                        if (!(path in this.articleCache)) {
                            continue;
                        }

                        // Pull in only the articles we want from the topic
                        const topic = this.articleCache[path];
                        for (const articleFile of Object.keys(topic)) {
                            const page = topic[articleFile];

                            // Make sure the current game's feature set allows this article
                            const meta = page.meta;
                            if (
                                Array.isArray(meta.features) &&
                                meta.features.length > 0 &&
                                !meta.features.every((feature) => game.features.includes(feature))
                            )
                                continue;

                            // Push the article
                            articles.push([articleFile, page]);
                        }
                    }

                    // At this point, the topic should have articles
                    if (articles.length === 0) throw new Error(`Could not locate articles: ${game.id}/${topic.path}/`);

                    // Add topic to menu
                    const articleList: MenuArticle[] = [];
                    const menuTopic: MenuTopic = {
                        id: topic.id,
                        name: topic.name,
                        link: `${game.id}/${category.id}/${topic.id}`,
                        articles: articleList
                    };
                    menuTopics.push(menuTopic);

                    // Push the article into the menu
                    for (const [articleID, page] of articles) {
                        const meta = page.meta;

                        const slug = new Slug(game.id, category.id, topic.id, articleID);

                        // Add article to index
                        this.gameArticles[game.id].push({
                            id: articleID,
                            slug: slug,
                            page: page
                        });

                        // Add the article to menu
                        const entry: MenuArticle = {
                            id: articleID,
                            name: meta.title || articleID,
                            link: slug.toString()
                        };
                        if (articleID === 'index') {
                            // Index articles are always at the top
                            articleList.unshift(entry);
                        } else {
                            articleList.push(entry);
                        }

                        // Add to collection of all articles
                        // console.log(`Pushed article ${articleID}`);
                    }
                }
            }
        }
    }
}
