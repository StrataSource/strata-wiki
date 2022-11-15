const fs = require("fs");
const pages = require("./list");

module.exports.generateMenu = (currentGame) => {
  if (pages.pageIndex[currentGame] != undefined) {
    return pages.pageIndex[currentGame];
  }
  return pages.rebuildPageIndex(currentGame);
};

module.exports.generateMenuHTML = (slug) => {
  var slugSplit = slug.split("/");

  var info = {
    game: slugSplit[0] || "index",
    category: slugSplit[1] || "index",
    article: slugSplit[2] || "index",
  };

  var res = `
  <a href="/${info.game}"${
    info.game == slug || info.game + "/" == slug ? ' class="active"' : ""
  }>Home</a>`;

  if (info.game == "index") {
    var menu = {};
  } else {
    var menu = this.generateMenu(info.game);
  }

  for (const [key, value] of Object.entries(menu)) {
    res += `<h5>${key.toUpperCase().replaceAll("-", " ")}</h5>`;

    for (const [k, v] of Object.entries(value)) {
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
        v.title || v.id.replaceAll("-", " ")
      }</a>`;
    }
  }

  return res;
};
