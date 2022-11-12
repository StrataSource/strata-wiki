const fs = require("fs");

module.exports.generateMenu = () => {
  var games = fs.readdirSync("pages");
  var res = {};

  for (let index = 0; index < games.length; index++) {
    const game = games[index];
    var gameMeta = require(`../pages/${game}/meta.json`);
    res[game] = {
      image: gameMeta.logo,
      icon: gameMeta.icon,
      name: gameMeta.name,
      categories: {},
    };

    var cats = fs.readdirSync(`pages/${game}`);
    cats = cats.sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      if (fs.lstatSync(`pages/${game}/${cat}`).isDirectory()) {
        res[game].categories[cat] = {
          name: cat.toUpperCase().replaceAll("-", " "),
          articles: {},
        };

        var articles = fs.readdirSync(`pages/${game}/${cat}`);
        articles = articles.sort((a, b) => a.localeCompare(b));
        for (let index = 0; index < articles.length; index++) {
          const article = articles[index].replaceAll(".md", "");
          res[game].categories[cat].articles[article] = {
            name: article.toLocaleUpperCase().replaceAll("-", " "),
          };
        }
      }
    }
  }

  return res;
};

module.exports.generateMenuHTML = (slug) => {
  var slugSplit = slug.split("/");

  var info = {
    game: slugSplit[0] || "index",
    category: slugSplit[1] || "index",
    article: slugSplit[2] || "index",
  };

  var res = ``;
  var menu = this.generateMenu();

  if (menu[info.game] == undefined) {
    throw new Error("Trying to access invalid game during menu generation!");
  }

  for (const [key, value] of Object.entries(menu[info.game].categories)) {
    res += `<h5>${value.name}</h5>`;

    for (const [k, v] of Object.entries(value.articles)) {
      if (info.game == "index") {
        var link = "/";
      } else if (key == "index") {
        var link = `/${info.game}`;
      } else if (k == "index") {
        var link = `/${info.game}/${key}`;
      } else {
        var link = `/${info.game}/${key}/${k}`;
      }

      res += `<a href="${link}"${link == "/" + slug ? ' class="active"' : ""}>${
        v.name
      }</a>`;
    }
  }

  return res;
};
