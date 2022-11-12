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
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      if (cat == "meta.json") {
      } else {
        res[game].categories[cat] = {
          name: cat.toUpperCase().replaceAll("-", " "),
          articles: {},
        };

        var articles = fs.readdirSync(`pages/${game}/${cat}`);
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
