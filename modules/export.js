const fs = require("fs-extra");
const md = require("./render");
const pages = require("./pages");
const template = require("./template");

module.exports.all = () => {
    function* stepGenerator() {
        let step = 1;
        while (true) {
            console.log(`--------------`);
            console.log(`    Step ${step++}`);
            console.log(`--------------`);
            yield;
        }
    }

    const step = stepGenerator();

    const startTime = performance.now();

    step.next();
    this.clean();

    step.next();
    this.copyAssets();

    step.next();
    template.generateNav();

    step.next();
    pages.buildIndex();

    step.next();
    this.saveAllPages();

    step.next();
    this.generateSpecialPages();

    step.next();
    this.copyGameMeta();

    step.next();
    const endTime = performance.now();
    console.log("Done!");
    console.log(
        "Building took",
        Math.ceil(endTime - startTime) / 1000,
        "seconds."
    );
};

module.exports.clean = () => {
    console.log("Clearing public folder...");
    fs.rmSync("public", { recursive: true });
    fs.mkdirSync("public");

    fs.mkdirSync("public/ajax");
};

module.exports.copyAssets = () => {
    console.log("Copying assets...");
    fs.copySync("assets", "public/assets");
};

module.exports.saveAllPages = () => {
    for (const entry of pages.all) {
        pages.savePage(entry);
    }
};

module.exports.copyGameMeta = () => {
    const gameList = pages.games();
    const games = {};

    for (let index = 0; index < gameList.length; index++) {
        const game = gameList[index];
        console.log("Processing game", game.id);
        games[game.id] = game;
    }

    fs.writeFileSync("public/ajax/games.json", JSON.stringify(games));
};

module.exports.generateSpecialPages = () => {
    const games = pages.games();
    for (const game of games) {
        let content = md.renderPage(`${game.id}/index`);
        content = {
            slug: `/${game.id}`,
            title: content.meta.title || "Home",
            file: `/pages/${game.id}/index.md`,
            id: "index",
            ...content,
        };
        pages.savePage(content);
    }
};
