import { Slug } from '../common/slug';
import { Article, GamesCategoryArray, Index, Menu, MenuCategoryItem } from '../common/types';
import fs from 'fs-extra';
import { Exporter } from './export';

export class PageHandler {
    private exporter: Exporter;

    menu: Menu;
    index: Index;
    allArticles: Article[] = [];
    games: GamesCategoryArray[];

    constructor(exporter) {
        this.exporter = exporter;

        // Read the pages folder, anything with a meta.json is a "game"
        this.games = fs
            .readdirSync('../pages')
            .filter((game) => fs.existsSync(`../pages/${game}/meta.json`))
            .map((game) => ({
                ...fs.readJSONSync(`../pages/${game}/meta.json`),
                id: game
            }));
    }

    buildIndex() {
        const index = {};
        const menu = {};

        // For each game, for each category, for each topic, render all articles
        for (const game of this.games) {
            index[game.id] = {
                id: game.id,
                meta: game,
                categories: {}
            };

            menu[game.id] = {};

            for (const category of game.categories) {
                // If this category is just a redirect,
                if (category.redirect) {
                    index[game.id].categories[category.id] = {
                        id: category.id,
                        meta: category,
                        redirect: category.redirect
                    };
                    continue;
                } else {
                    index[game.id].categories[category.id] = {
                        id: category.id,
                        meta: category,
                        topics: {}
                    };
                }

                const menuCategory: MenuCategoryItem[] = [];

                for (const topic of category.topics) {
                    if (!topic.path) topic.path = topic.id;

                    // Check if index.md exists
                    const possiblePaths = [`${game.id}/${topic.path}/`, `shared/${topic.path}/`];

                    let directoryPath = null;
                    for (const path of possiblePaths) {
                        console.log('Checking file path', '../pages/' + path);
                        if (fs.existsSync('../pages/' + path)) {
                            directoryPath = '../pages/' + path;
                            console.log('Found file at path', path);
                            break;
                        }
                    }
                    if (!directoryPath)
                        throw new Error(`Could not locate directory: ../pages/${game.id}/${topic.path}/`);

                    index[game.id].categories[category.id].topics[topic.id] = {
                        id: topic.id,
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

                    console.log('Reading directory', directoryPath);

                    const articles = fs.readdirSync(directoryPath, {
                        withFileTypes: true
                    });

                    const articleList: MenuCategoryItem[] = [];

                    for (const articleFile of articles) {
                        // Exclude all directories
                        if (articleFile.isDirectory()) continue;

                        const articleString = articleFile.name.replace('.md', '');

                        // Render out the markdown
                        const result = this.exporter.renderer.renderPage(
                            directoryPath + articleFile.name,
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
                            file: directoryPath + articleString + '.md',
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
                    }

                    //Add local article list to menu
                    for (const article of articleList) {
                        menuCategory.push(article);
                    }
                }

                menu[game.id][category.id] = menuCategory;
            }
        }

        fs.writeFileSync('public/ajax/menu.json', JSON.stringify(menu));

        this.menu = menu as Menu;
        this.index = index as Index;
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
