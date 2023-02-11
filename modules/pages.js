const fs = require("fs-extra");
const renderer = require("./render");
const { applyTemplate } = require("./template");

/**
 * Lists all known games
 * @returns {{id: string, logo: string, icon: string, name: string, nameShort: string, color: string, categories: {label: string, id: string, home: string, topics: {id: string, name: string}[]}[], features: string[]}[]} An array of game objects, metadata included
 */
module.exports.games = () => {
    let res = [];

    let games = fs.readdirSync("pages");

    for (let index = 0; index < games.length; index++) {
        const game = games[index];
        if (fs.existsSync(`pages/${game}/meta.json`)) {
            res.push({
                ...require(`../pages/${game}/meta.json`),
                id: game,
            });
        }
    }

    return res;
};

/**
 * Converts a URL friendly slug to the direct path to the fitting markdown file
 * @param {string} slug The slug of the page
 * @returns {string} Path to a makrdown file
 */
module.exports.slugToPath = (slug) => {
    let info = this.parseSlug(slug);

    let path = undefined;
    let possiblePaths = [
        `${info.game}/${info.topic}/${info.article}.md`,
        `shared/${info.topic}/${info.article}.md`,
        `${info.game}/index.md`,
        `shared/index.md`,
    ];

    for (let index = 0; index < possiblePaths.length; index++) {
        const p = possiblePaths[index];
        console.log("Checking file path", "pages/" + p);
        if (path === undefined && fs.existsSync("pages/" + p)) {
            path = "pages/" + p;
        }
    }

    if (path === undefined) {
        throw new Error("Could not locate Markdown file for slug: " + slug);
    }

    return path;
};

/**
 * Seperates the slug into an easily digestable object
 * @param {string} slug The slug you are trying to parse
 * @returns {{game: string, topic: string, category: string, article: string}}
 */
module.exports.parseSlug = (slug) => {
    if (
        slug.toLowerCase().startsWith("ajax") ||
        slug.toLowerCase().startsWith("assets")
    ) {
        throw new Error(
            `Page names starting with "ajax" or "assets" are not permitted! Trying to render page ${slug}`
        );
    }

    let slugParsed = slug.split("/");
    let info = {
        game: slugParsed[0] || "index",
        category: slugParsed[1] || "index",
        topic: slugParsed[2] || "index",
        article: slugParsed[3] || "index",
    };
    return info;
};

module.exports.index = {};
module.exports.menu = {};
module.exports.all = [];

module.exports.buildIndex = () => {
    let res = {};

    let gameList = this.games();

    for (let index = 0; index < gameList.length; index++) {
        const game = gameList[index];
        res[game.id] = {
            id: game.id,
            meta: game,
            categories: {},
        };

        this.menu[game.id] = {};

        for (let index = 0; index < game.categories.length; index++) {
            const category = game.categories[index];

            res[game.id].categories[category.id] = {
                id: category.id,
                meta: category,
                topics: {},
            };

            let menu = [];

            for (let index = 0; index < category.topics.length; index++) {
                const topic = category.topics[index];
                //Check if index.md exists
                let path = this.slugToPath(
                    `${game.id}/${category.id}/${topic.id}`
                ).replace("index.md", "");

                res[game.id].categories[category.id].topics[topic.id] = {
                    id: topic.id,
                    meta: topic,
                    articles: {},
                };

                //Add topic to menu
                menu.push({
                    type: "topic",
                    id: topic.id,
                    text: topic.name,
                    link: `${game.id}/${category.id}/${topic.id}`,
                });

                let articles = fs.readdirSync(path);

                for (let index = 0; index < articles.length; index++) {
                    const article = articles[index].replace(".md", "");
                    let result = renderer.renderPage(
                        `${game.id}/${category.id}/${topic.id}/${article}`
                    );

                    console.log(result.slug, result.meta);

                    let meta = result.meta;
                    let willBeAdded = true;

                    if (meta.features != undefined && meta.features != []) {
                        for (let ind = 0; ind < meta.features.length; ind++) {
                            const feature = meta.features[ind];

                            if (!meta.features.includes(feature)) {
                                willBeAdded = false;
                            }
                        }
                    }

                    if (willBeAdded) {
                        res[game.id].categories[category.id].topics[
                            topic.id
                        ].articles[article] = {
                            content: result.content,
                            id: article,
                            title: meta.title || article,
                            slug: result.slug,
                            file: path + article + ".md",
                            meta: meta,
                        };

                        /*this.savePage(
                            res[game.id].categories[category.id].topics[
                                topic.id
                            ].articles[article]
                        );*/

                        //Add article to menu
                        menu.push({
                            type: "article",
                            id: topic.id + "_" + article,
                            text: meta.title || article,
                            link: result.slug,
                        });

                        this.all.push(
                            res[game.id].categories[category.id].topics[
                                topic.id
                            ].articles[article]
                        );
                    }
                }
            }

            this.menu[game.id][category.id] = menu;
        }
    }

    fs.writeFileSync("public/ajax/menu.json", JSON.stringify(this.menu));

    this.index = res;
    return res;
};

/**
 * Saves an article to the right directories
 * @param {Object} article The article object
 */
module.exports.savePage = (article) => {
    let path = article.slug.split("/");
    path.pop();
    path = path.join("/");

    //Writing JSON meta to file
    console.log("public/ajax/article/" + path);
    fs.mkdirSync("public/ajax/article/" + path, { recursive: true });
    fs.writeFileSync(
        "public/ajax/article/" + path + "/" + article.id + ".json",
        JSON.stringify(article)
    );

    //Writing HTML to file
    console.log("public/" + path);
    fs.mkdirSync("public/" + path, { recursive: true });
    fs.writeFileSync(
        "public/" + path + "/" + article.id + ".html",
        applyTemplate(article.content, {
            slug: article.slug,
            title: article.title,
            file: article.file.substring(5),
        })
    );
};
