const fs = require("fs-extra");
const md = require("./render");
const path = require("path");
const templater = require("./templater");
const pages = require("./list");

function getAllFiles(dir, allFilesList = []) {
  const files = fs.readdirSync(dir);
  files.map((file) => {
    const name = dir + "/" + file;
    if (fs.statSync(name).isDirectory()) {
      // check if subdirectory is present
      getAllFiles(name, allFilesList); // do recursive execution for subdirectory
    } else {
      allFilesList.push(name); // push filename into the array
    }
  });

  return allFilesList;
}

module.exports.exportPage = (slug) => {
  var html = templater.applyTemplate(md.renderPage(slug), slug);

  var location = `public/${slug}.html`.replaceAll("/.html", "/index.html").replaceAll("//", "/");

  console.log("Exporting file", slug, "->", location);

  fs.mkdirSync(path.parse(location).dir, { recursive: true });
  fs.writeFileSync(location, html);
};

module.exports.exportAllPages = () => {
  var games = pages.games();

  for (let game_i = 0; game_i < games.length; game_i++) {
    const game = games[game_i];

    console.log("Exporting", game.id);

    pages.rebuildPageIndex(game.id);

    var cats = pages.pageIndex[game.id];

    for (const [cat_id, cat] of Object.entries(cats)) {
      for (const [key, article] of Object.entries(cat)) {
        this.exportPage(`${game.id}/${cat_id}/${article.id}`);
      }
    }
  }

  fs.copySync("assets", "public/assets");

  this.exportPage("");
  this.exportPage("/404");

  //fs.copySync("public/index/index.html", "public/index.html");
  //fs.copySync("public/index/404/index.html", "public/404.html");
};
