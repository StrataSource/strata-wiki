const fs = require("fs");

var md = require("markdown-it")({
  linkify: true,
  typographer: true,
});

module.exports.test = () => {
  console.log("Hi");
};

module.exports.render = (str) => {
  return md.render(str);
};

module.exports.renderPage = (slug) => {
  if (
    slug.toLowerCase().startsWith("ajax") ||
    slug.toLowerCase().startsWith("assets")
  ) {
    throw new Error(
      `Page names startign with "ajax" or "assets" are not permitted!`
    );
  }

  var source = fs.readFileSync(`pages/${slug}.md`, { encoding: "utf-8" });
  return this.render(source);
};
