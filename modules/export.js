const fs = require("fs");
const md = require("./render");
const path = require("path");

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
  var html = md.renderPage(slug);

  var location = `public/${slug}.html`;

  fs.mkdirSync(path.parse(location).dir, { recursive: true });
  fs.writeFileSync(location, html);
};
module.exports.exportAllPages = () => {
  var list = getAllFiles("pages");
  for (let index = 0; index < list.length; index++) {
    const page = list[index];
    this.exportPage(page.substring(6).replaceAll(".md", "")); //Janky fix, but it works
  }
};
