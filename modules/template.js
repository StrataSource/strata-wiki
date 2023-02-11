const pages = require("./pages");
const fs = require("fs-extra");

let navs = {};

/**
 *
 * @param {string} html The HTML input to be put inside the content
 * @param {{slug: string, title: string, file: string}} opts Options for generating
 * @returns {string} The generated HTML with the template applied
 */
module.exports.applyTemplate = (html, opts = {}) => {
    const info = pages.parseSlug(opts.slug);

    opts.sidebar = this.generateSidebar(opts.slug);
    opts.categories = navs[info.game];

    //Generate title
    opts.title = opts.title;
    opts.content = html;

    //Read template HTML
    let res = fs.readFileSync("templates/main.html", "utf-8");
    console.log("Templating", opts);

    //Replacing values from opts in HTML
    for (const [key, value] of Object.entries(opts)) {
        res = res.replaceAll(`%${key.toUpperCase()}%`, value);
    }

    return res;
};

/**
 * Generates the sidebar HTML for a specific page
 * @param {string} slug Slug to the page next to the sidebar
 * @returns {string} HTML generated for the sidebar
 */
module.exports.generateSidebar = (slug) => {
    const info = pages.parseSlug(slug);
    const data = pages.menu[info.game][info.category];

    console.log("DATA", data, "INFO", info, "SLUG", slug);

    if (!data) {
        return ``;
    }

    let res = ``;
    for (let index = 0; index < data.length; index++) {
        const entry = data[index];
        res += `<a href="/${entry.link}" class="${entry.type}">${entry.text}</a>`;
    }

    return res;
};
/**
 * Generates the top nav links for all pages
 */
module.exports.generateNav = () => {
    let games = pages.games();

    for (let index = 0; index < games.length; index++) {
        const game = games[index];
        let res = ``;

        for (let index = 0; index < game.categories.length; index++) {
            const category = game.categories[index];
            res += `<a href="/${game.id}/${category.id}/${category.home}">${category.label}</a>`;
        }

        navs[game.id] = res;
    }
};
