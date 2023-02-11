const fs = require("fs");
const hljs = require("highlight.js");
const yaml = require("yaml");
const container_block = require("markdown-it-container");
const pages = require("./pages");

let meta = {};

const md = require("markdown-it")({
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

const games = pages.games();

for (const game of games) {
    console.log("Registered game", game.id);

    md.use(container_block, game.id, {
        validate: function (params) {
            return params.trim() === game.id;
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                // opening tag
                return `<div class='${
                    game.id
                }-only exclusive'><div class="exclusive-header">${
                    game.nameShort || game.name || game.id
                } only!</div>\n`;
            } else {
                // closing tag
                return "</div>\n";
            }
        },
    });
}

/**
 * Renders any Markdown string into HTML
 * @param {string} str A string of raw Markdown
 * @param {string} slug The slug of the current page, used for passthrough
 * @returns {{content: string, meta: object, slug: string}} An object that includes the rendered HTML.
 */
module.exports.render = (str, slug = undefined) => {
    meta = {};
    return {
        content: md.render(str),
        meta: meta,
        slug: slug,
    };
};

/**
 * Renders Markdown into a page based on the slug
 * @param {string} slug The slug to the page
 * @returns {{content: string, meta: {title: string, features: string[]}, slug: string}} rendered HTML of the page
 */
module.exports.renderPage = (slug) => {
    const source = pages.slugToPath(slug);

    console.log("Rendering file", slug, "->", source);

    return this.render(
        fs.readFileSync(source, {
            encoding: "utf-8",
        }),
        slug
    );
};
