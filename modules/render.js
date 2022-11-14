const fs = require("fs");
var hljs = require("highlight.js");
const yaml = require("yaml");
const container_block = require("markdown-it-container");

var meta = {};

var md = require("markdown-it")({
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return "";
  },
})
  .use(require("markdown-it-front-matter"), function (fm) {
    meta = yaml.parse(fm);
  })
  .use(container_block, "p2ce", {
    render: function (tokens, idx) {
      var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

      if (tokens[idx].nesting === 1) {
        // opening tag
        return "<div class='p2ce'><div>P2CE Only!</div>\n";
      } else {
        // closing tag
        return "</div>\n";
      }
    },
  });

module.exports.test = () => {
  console.log("Hi");
};

module.exports.render = (str) => {
  meta = {};
  return {
    content: md.render(str),
    meta: meta,
  };
};

module.exports.renderPage = (slug) => {
  if (
    slug.toLowerCase().startsWith("ajax") ||
    slug.toLowerCase().startsWith("assets")
  ) {
    throw new Error(
      `Page names startign with "ajax" or "assets" are not permitted! Trying to render page ${slug}`
    );
  }

  if (fs.existsSync(`pages/${slug}.md`)) {
    var source = fs.readFileSync(`pages/${slug}.md`, { encoding: "utf-8" });
  } else if (fs.existsSync(`pages/${slug}/index.md`)) {
    var source = fs.readFileSync(`pages/${slug}/index.md`, {
      encoding: "utf-8",
    });
  } else {
    var source = fs.readFileSync("pages/index/404/index.md", { encoding: "utf-8" });
  }
  return this.render(source);
};
