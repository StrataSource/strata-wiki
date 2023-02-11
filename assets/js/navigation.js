let games = {};
let menu = {};

/**
 * Downloads data needed for AJAX nav and initialize it
 */
async function init() {
    updateAllLinkListeners();
    let req = await fetch("/ajax/games.json");
    games = await req.json();
    req = await fetch("/ajax/menu.json");
    menu = await req.json();

    //Regenerate UI
    let info = parseSlug(location.pathname.substring(1));
    regenerateNav(info);
    regenerateSidebar(info);
    generateGameSelector(info.game);
    updateAllLinkListeners();
}
window.addEventListener("load", init);

function generateGameSelector(current) {
    let container = document.querySelector(".games");
    container.innerHTML = "";

    for (const [key, value] of Object.entries(games)) {
        let btn = document.createElement("button");
        btn.classList.add("game-selector");
        btn.onclick = () => {
            switchGame(value.id);
        };

        let icon = document.createElement("img");
        icon.src = value.icon;
        icon.classList.add("icon");
        icon.style.background = value.color;

        btn.append(icon);

        let name = document.createElement("span");
        name.innerText = value.name;

        btn.append(name);

        container.append(btn);
    }
}

async function navigate(slug, replace = false) {
    let info = parseSlug(slug);

    if (info.category === "index") {
        info.category = "";
        info.topic = "";
    }

    let path = `/ajax/article/${info.game}/${info.category}/${info.topic}/${info.article}.json`;

    path.replaceAll("//", "/");

    let req = await fetch(path);

    if (req.status === 404) {
        throw new Error("Page not found");
    }

    let data = await req.json();
    console.log("NAV RESULT", data);

    document.querySelector(".content").innerHTML = data.content;
    if (replace) {
        history.replaceState(slug, "", "/" + slug);
    } else {
        history.pushState(slug, "", "/" + slug);
    }
    document.title = `${data.title} - ${games[info.game].name} Wiki`;
    document.querySelector(
        ".edit a"
    ).href = `https://github.com/ChaosInitiative/Wiki/tree/system-migration/${data.file}`;

    regenerateSidebar(info);
    regenerateNav(info);
    generateGameSelector(info.game);

    updateAllLinkListeners();
}
window.addEventListener("popstate", () => {
    navigate(location.pathname.substring(1), true);
});
function regenerateSidebar(info) {
    let data = menu[info.game][info.category];
    let container = document.querySelector(".sidebar");
    container.innerHTML = "";

    if (!data) {
        container.innerHTML = "Nothing to show!";
        return;
    }

    for (let index = 0; index < data.length; index++) {
        const entry = data[index];
        let el = document.createElement("a");
        el.id = `sb-${entry.id}`;
        el.innerText = entry.text;
        el.href = "/" + entry.link;
        switch (entry.type) {
            case "topic":
                el.classList.add("topic");
                break;
            default:
                el.classList.add("article");
                break;
        }
        let loc = location.pathname.substring(1).replace(/\/$/, "");
        if (entry.link === loc || entry.link === loc + "/index") {
            el.classList.add("active");
        }
        container.append(el);
    }
}
function regenerateNav(info) {
    let data = games[info.game].categories;
    let container = document.querySelector(".categories");
    container.innerHTML = "";
    for (let index = 0; index < data.length; index++) {
        const cat = data[index];
        let el = document.createElement("a");
        el.innerText = cat.label;
        el.href = `/${info.game}/${cat.id}/${cat.home}`;
        if (cat.id === info.category) {
            el.classList.add("active");
        }
        container.append(el);
    }
}

/**
 *
 * @param {MouseEvent} e
 */
function linkClickHandler(e) {
    e.preventDefault();
    console.log("GOING TO", e.target.href);
    let url = new URL(e.target.href, location);
    if (url.host != location.host) {
        window.open(e.target.href, "_blank");
    } else {
        navigate(url.pathname.substring(1));
    }
}

async function switchGame(game) {
    let split = location.pathname.substring(1).split("/");
    split[0] = game;
    try {
        await navigate(split.join("/"));
    } catch {
        await navigate(`${game}`);
    }
}

async function updateAllLinkListeners() {
    let links = document.querySelectorAll("a");
    for (let index = 0; index < links.length; index++) {
        const link = links[index];
        if (link.href.startsWith("javascript:")) {
            link.onclick = () => {};
        } else {
            link.onclick = linkClickHandler;
        }
    }
}

/**
 * Seperates the slug into an easily digestable object
 * @param {string} slug The slug you are trying to parse
 * @returns {{game: string, topic: string, category: string, article: string}}
 */
function parseSlug(slug) {
    let slugParsed = slug.split("/");
    let info = {
        game: slugParsed[0] || "index",
        category: slugParsed[1] || "index",
        topic: slugParsed[2] || "index",
        article: slugParsed[3] || "index",
    };
    return info;
}
