const fs = require("fs");
var hljs = require("highlight.js");
const yaml = require("yaml");
const container_block = require("markdown-it-container");
const pages = require("./list");

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

module.exports.render = (str, slug = undefined) => {
  meta = {};
  return {
    content: md.render(str),
    meta: meta,
    slug: slug,
  };
};

module.exports.renderPage = (slug) => {
  var source = pages.slugToPath(slug);

  console.log("Rendering page", slug, "->", source);

  return this.render(
    fs.readFileSync(source, {
      encoding: "utf-8",
    }),
    source
  );
};
