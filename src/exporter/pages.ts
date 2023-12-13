import { Slug } from '../common/slug';
import { Article, Game, Index, Menu, MenuCategoryItem } from '../common/types';
import fs from 'fs-extra';
import { Exporter } from './export';

export class PageHandler {
    private exporter: Exporter;

    menu: Menu;
    index: Index;
    allArticles: Article[] = [];
    games: Game[];

    constructor(exporter) {
        this.exporter = exporter;

        // Read the pages folder, anything with a meta.json is a "game"
        this.games = fs
            .readdirSync('../pages')
            .filter((game) => fs.existsSync(`../pages/${game}/meta.json`))
            .map(
                (game) =>
                    ({
                        ...fs.readJSONSync(`../pages/${game}/meta.json`),
                        id: game
                    } as Game)
            );
    }

    buildIndex(): void {
        const index: Index = {};
        const menu: Menu = {};

        const pageDir: string = '../pages/';

        // For each game, for each category, for each topic, render all articles
        for (const game of this.games) {
            index[game.id] = {
                id: game.id,
                meta: game as Game,
                categories: {}
            };

            menu[game.id] = {};

            for (const category of game.categories) {
                // Insert the category into the index
                index[game.id].categories[category.id] = {
                    meta: category,
                    topics: {}
                };

                // If this category is just a redirect, we don't need to render any pages
                if (category.redirect) continue;

                // It's a normal category, so we'll need to fill in its topics
                const menuCategory: MenuCategoryItem[] = [];
                for (const topic of category.topics) {
                    if (!topic.path) topic.path = topic.id;

                    // Array of tuples of [directory path, article]
                    const articles: [string, string][] = [];

                    // Search all possible paths for articles and build a list of every article we find
                    const possiblePaths = [`${game.id}/${topic.path}/`, `shared/${topic.path}/`];
                    for (const searchPath of possiblePaths) {
                        const path: string = pageDir + searchPath;
                        if (fs.existsSync(path)) {
                            console.log(`Searching for articles in ${path}`);
                            const dirArticles = fs.readdirSync(path, {
                                withFileTypes: true
                            });

                            for (const articleFile of dirArticles) {
                                // Exclude all directories
                                if (articleFile.isDirectory()) continue;

                                // Push the parent and the name
                                articles.push([path, articleFile.name]);
                            }
                        }
                    }

                    if (articles.length === 0) throw new Error(`Could not locate articles: ${game.id}/${topic.path}/`);

                    index[game.id].categories[category.id].topics[topic.id] = {
                        meta: topic,
                        articles: {}
                    };

                    // Add topic to menu
                    menuCategory.push({
                        type: 'topic',
                        id: topic.id,
                        text: topic.name,
                        link: `${game.id}/${category.id}/${topic.id}`
                    });

                    const articleList: MenuCategoryItem[] = [];

                    // Render article markdown
                    for (const [articleDir, articleFile] of articles) {
                        // Get a path to the article and a clean version for the slug
                        const articlePath = articleDir + articleFile;
                        const articleString = articleFile.replace('.md', '');

                        // Render out the markdown
                        const result = this.exporter.renderer.renderPage(
                            articlePath,
                            new Slug(game.id, category.id, topic.id, articleString)
                        );

                        // Make sure the current game's feature set allows this article
                        const meta = result.meta;
                        if (
                            Array.isArray(meta.features) &&
                            meta.features.length > 0 &&
                            !meta.features.every((feature) => index[game.id]?.meta.features.includes(feature))
                        )
                            continue;

                        const article: Article = {
                            id: articleString,
                            content: result.content,
                            title: meta.title || articleString,
                            slug: result.slug,
                            file: articlePath,
                            meta: meta
                        };

                        // Add article to index
                        index[game.id].categories[category.id].topics[topic.id].articles[articleString] = article;

                        // Add to menu
                        const entry: MenuCategoryItem = {
                            type: 'article',
                            id: topic.id + '_' + articleString,
                            text: meta.title || articleString,
                            link: result.slug.toString()
                        };
                        if (articleString === 'index') {
                            articleList.unshift(entry);
                        } else {
                            articleList.push(entry);
                        }

                        // Add to collection of all articles
                        this.allArticles.push(article);
                        console.log(`Pushed article ${article.id}`);
                    }

                    // Add local article list to menu
                    for (const article of articleList) {
                        menuCategory.push(article);
                    }
                }

                menu[game.id][category.id] = menuCategory;
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
    savePage(article: Article): void {
        const path = article.slug.toString().split('/').slice(0, -1).join('/');

        article.file = article.file.replaceAll('../', '');
        if (article.file[0] === '/') {
            article.file = article.file.slice(1);
        }

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
                html: article.content,
                slug: article.slug,
                title: article.title,
                file: article.file.slice(5)
            })
        );
    }
}
