const fs = require("fs");
const menu = require("./menu");
const pages = require("./list");

module.exports.applyTemplate = (input, slug) => {
    var template = fs.readFileSync("templates/wiki.html", "utf-8");

    var slugSplit = slug.split("/");

    var info = {
        game: slugSplit[0] || "index",
        category: slugSplit[1] || "index",
        article: slugSplit[2] || "index",
    };

    var gameSelector = ``;
    var games = pages.games();

    for (let index = 0; index < games.length; index++) {
        const game = games[index];

        gameSelector += `
    <a href="/${game.id}" class="game${
            game.id == info.game ? " active" : ""
        }" style="--primary: ${game.color}; --primaryTransparent: ${
            game.color
        }80">
      <img
        src="${game.logo}"
      />
    </a>`;
    }

    return template
        .replaceAll("%CONTENT%", input.content)
        .replaceAll(
            "%EDITLINK%",
            `https://github.com/ChaosInitiative/Wiki/edit/main/${pages.slugToPath(
                slug
            )}`
        )
        .replaceAll("%MENU%", menu.generateMenuHTML(slug))
        .replaceAll("%GAMESELECTOR%", gameSelector)
        .replaceAll("%TITLE%", input.meta.title || info.article)
        .replaceAll("%GAME%", info.game);
};
