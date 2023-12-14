import { Slug } from '../common/slug';
import { Article, MetaGame, Index, Menu, MenuArticle, MenuTopic, RenderedPage } from '../common/types';
import fs from 'fs-extra';
import { Exporter } from './export';

export class PageHandler {
    private exporter: Exporter;

    menu: Menu;
    index: Index;
    articleCache: { [path: string]: { [article: string]: RenderedPage } };

    constructor(exporter) {
        this.exporter = exporter;

        this.articleCache = {};
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
            const result = this.exporter.renderer.renderPage(topicPath + '/' + articleName);
            this.articleCache[topicDir][articleID] = result;
        }
    }

    buildIndex(games: MetaGame[]): void {
        const index: Index = {};
        const menu: Menu = {};

        // For each game, for each category, for each topic, render all articles
        for (const game of games) {
            index[game.id] = {
                id: game.id,
                categories: {}
            };

            menu[game.id] = {};

            for (const category of game.categories) {
                // Insert the category into the index
                index[game.id].categories[category.id] = {
                    topics: {}
                };

                // If this category is just a redirect, we don't need to render any pages
                if (category.redirect) continue;

                // It's a normal category, so we'll need to fill in its topics
                const menuTopics: MenuTopic[] = [];
                menu[game.id][category.id] = menuTopics;
                for (const topic of category.topics) {
                    if (!topic.path) topic.path = topic.id;

                    // Array of tuples of [article, page]
                    const articles: [string, RenderedPage][] = [];

                    // Search all possible paths for articles and build a list of every article we want
                    const possiblePaths = [`${game.id}/${topic.path}`, `shared/${topic.path}`];
                    for (const path of possiblePaths) {
                        // Skip topics not in the cache
                        if (!(path in this.articleCache)) {
                            continue;
                        }

                        // Pull in the articles we want from the topic
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

                            // Push the parent and the name
                            articles.push([articleFile, page]);
                        }
                    }

                    if (articles.length === 0) throw new Error(`Could not locate articles: ${game.id}/${topic.path}/`);

                    index[game.id].categories[category.id].topics[topic.id] = {
                        articles: {}
                    };

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

                        const article: Article = {
                            id: articleID,
                            content: page.content,
                            name: meta.title || articleID,
                            slug: slug,
                            meta: meta
                        };

                        // Add article to index
                        index[game.id].categories[category.id].topics[topic.id].articles[articleID] = article;

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
                        console.log(`Pushed article ${article.id}`);
                    }
                }
            }
        }

        fs.writeFileSync('public/ajax/menu.json', JSON.stringify(menu));

        this.menu = menu;
        this.index = index;
    }

    /**
     * Saves an article to the right directories
     * @param {Object} article The article object
     */
    savePage(metaGame: MetaGame, article: Article): void {
        const path = article.slug.toString().split('/').slice(0, -1).join('/');

        // Writing JSON meta to file
        console.log('public/ajax/article/' + path);
        fs.mkdirSync('public/ajax/article/' + path, { recursive: true });
        fs.writeFileSync('public/ajax/article/' + path + '/' + article.id + '.json', JSON.stringify(article));

        // Writing HTML to file
        console.log('public/' + path);
        fs.mkdirSync('public/' + path, { recursive: true });
        fs.writeFileSync(
            'public/' + path + '/' + article.id + '.html',
            this.exporter.templater.applyTemplate({
                metaGame: metaGame,
                html: article.content,
                title: article.name,
                menuTopics: this.menu[metaGame.id][article.slug.category]
            })
        );
    }
}
