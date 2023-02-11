const fs = require("fs-extra");
const md = require("./render");
const pages = require("./pages");
const template = require("./template");

module.exports.all = () => {
    function step(i) {
        console.log(`--------------`);
        console.log(`    Step ${i}`);
        console.log(`--------------`);
    }

    step(1);
    this.clean();

    step(2);
    this.copyAssets();

    step(3);
    template.generateNav();

    step(4);
    pages.buildIndex();

    step(5);
    this.saveAllPages();

    step(6);
    this.generateSpecialPages();

    step(7);
    this.copyGameMeta();

    step(8);
    console.log("Done!");
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
    for (let index = 0; index < pages.all.length; index++) {
        const entry = pages.all[index];
        pages.savePage(entry);
    }
};

module.exports.copyGameMeta = () => {
    let gameList = pages.games();
    let games = {};

    for (let index = 0; index < gameList.length; index++) {
        const game = gameList[index];
        console.log("Processing game", game.id);
        games[game.id] = game;
    }

    fs.writeFileSync("public/ajax/games.json", JSON.stringify(games));
};

module.exports.generateSpecialPages = () => {
    let games = pages.games();
    for (let index = 0; index < games.length; index++) {
        const game = games[index];
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
