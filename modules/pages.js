const fs = require("fs-extra");
const renderer = require("./render");
const { applyTemplate } = require("./template");

/**
 * Lists all known games
 * @returns {{id: string, logo: string, icon: string, name: string, nameShort: string, color: string, categories: {label: string, id: string, home: string, topics: {id: string, name: string}[]}[], features: string[]}[]} An array of game objects, metadata included
 */
module.exports.games = () => {
    const games = fs.readdirSync("pages");
    return games
        .filter((game) => fs.existsSync(`pages/${game}/meta.json`))
        .map((game) => ({
            ...require(`../pages/${game}/meta.json`),
            id: game,
        }));
};

/**
 * Converts a URL friendly slug to the direct path to the fitting markdown file
 * @param {string} slug The slug of the page
 * @returns {string} Path to a makrdown file
 */
module.exports.slugToPath = (slug) => {
    const info = this.parseSlug(slug);

    const possiblePaths = [
        `${info.game}/${info.topic}/${info.article}.md`,
        `shared/${info.topic}/${info.article}.md`,
        `${info.game}/index.md`,
        `shared/index.md`,
    ];

    for (const p of possiblePaths) {
        console.log("Checking file path", "pages/" + p);
        if (fs.existsSync("pages/" + p)) {
            return "pages/" + p;
        }
    }

    throw new Error("Could not locate Markdown file for slug: " + slug);
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

    const slugParsed = slug.split("/");
    return {
        game: slugParsed[0] || "index",
        category: slugParsed[1] || "index",
        topic: slugParsed[2] || "index",
        article: slugParsed[3] || "index",
    };
};

module.exports.index = {};
module.exports.menu = {};
module.exports.all = [];

module.exports.buildIndex = () => {
    let res = {};

    const gameList = this.games();

    for (const game of gameList) {
        res[game.id] = {
            id: game.id,
            meta: game,
            categories: {},
        };

        this.menu[game.id] = {};

        for (const category of game.categories) {
            res[game.id].categories[category.id] = {
                id: category.id,
                meta: category,
                topics: {},
            };

            let menu = [];

            for (const topic of category.topics) {
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

                const articles = fs.readdirSync(path);

                for (let article of articles) {
                    article = article.replace(".md", "");
                    const result = renderer.renderPage(
                        `${game.id}/${category.id}/${topic.id}/${article}`
                    );

                    console.log(result.slug, result.meta);

                    const meta = result.meta;
                    let willBeAdded = true;

                    if (
                        Array.isArray(meta.features) &&
                        meta.features.length === 0
                    ) {
                        for (const feature of meta.features) {
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
            file: article.file.slice(5),
        })
    );
};
