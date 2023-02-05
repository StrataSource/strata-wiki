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
}).use(require("markdown-it-front-matter"), function (fm) {
    meta = yaml.parse(fm);
});

var games = pages.games();

for (let index = 0; index < games.length; index++) {
    const game = games[index];

    console.log("Registered game", game.id);

    md.use(container_block, game.id, {
        validate: function (params) {
            return params.trim() == game.id;
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                // opening tag
                return `<div class='${game.id}-only exclusive'><div class="exclusive-header">${
                    game.nameShort || game.name || game.id
                } only!</div>\n`;
            } else {
                // closing tag
                return "</div>\n";
            }
        },
    });
}

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
