const fs = require("fs-extra");
const md = require("./render");

module.exports.pageIndex = {};

module.exports.rebuildPageIndex = (game) => {
  console.log("Building page index for", game);

  var gameMeta = require(`../pages/${game}/meta.json`);

  var res = {};

  var cats = require(`../pages/${game}/meta.json`).categories;

  for (let index = 0; index < cats.length; index++) {
    const cat = cats[index];
    res[cat] = {};

    var articles = [];
    if (fs.existsSync(`pages/shared/${cat}`)) {
      articles = [...articles, ...fs.readdirSync(`pages/shared/${cat}`)];
    }
    if (fs.existsSync(`pages/${game}/${cat}`)) {
      articles = [...articles, ...fs.readdirSync(`pages/${game}/${cat}`)];
    }

    articles = [...new Set(articles)];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];

      var source = this.slugToPath(`${game}/${cat}/${article}`);

      var meta = md.render(fs.readFileSync(source, "utf-8")).meta;

      var willBeAdded = true;

      if (meta.features != undefined && meta.features != []) {
        for (let ind = 0; ind < meta.features.length; ind++) {
          const feature = meta.features[ind];

          if (!gameMeta.features.includes(feature)) {
            willBeAdded = false;
          }
        }
      }

      if (willBeAdded) {
        res[cat][article.slice(0, -3)] = {
          ...meta,
          path: source,
          id: article.slice(0, -3),
          cat: cat,
        };
      }
    }
  }

  this.pageIndex[game] = res;

  return res;
};

module.exports.slugToPath = (slug) => {
  var slugParsed = slug.split("/");

  if (
    slug.toLowerCase().startsWith("ajax") ||
    slug.toLowerCase().startsWith("assets")
  ) {
    throw new Error(
      `Page names starting with "ajax" or "assets" are not permitted! Trying to render page ${slug}`
    );
  }

  var info = {
    game: slugParsed[0] || "index",
    cat: slugParsed[1] || "index",
    article: slugParsed[2] || "index",
  };

  if (!info.article.endsWith(".md")) {
    info.article += ".md";
  }

  if (fs.existsSync(`pages/${info.game}/${info.cat}/${info.article}`)) {
    var path = `pages/${info.game}/${info.cat}/${info.article}`;
  } else if (fs.existsSync(`pages/shared/${info.cat}/${info.article}`)) {
    var path = `pages/shared/${info.cat}/${info.article}`;
  } else if (
    info.cat == "index" &&
    fs.existsSync(`pages/${info.game}/index.md`)
  ) {
    var path = `pages/${info.game}/index.md`;
  } else {
    var path = `pages/index/404.md`;
  }

  return path;
};

module.exports.games = () => {
  var res = [];

  var games = fs.readdirSync("pages");

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
