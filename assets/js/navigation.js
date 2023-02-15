let games = {};
let menu = {};

/**
 * Downloads data needed for AJAX nav and initialize it
 */
async function init() {
    updateAllLinkListeners();
    const gameReq = await fetch('/ajax/games.json');
    games = await gameReq.json();
    const menuReq = await fetch('/ajax/menu.json');
    menu = await menuReq.json();

    //Regenerate UI
    const info = parseSlug(location.pathname.slice(1));
    regenerateNav(info);
    regenerateSidebar(info);
    generateGameSelector(info.game);
    updateAllLinkListeners();
}
window.addEventListener('load', init);

function generateGameSelector(_current) {
    const container = document.querySelector('.games');
    container.innerHTML = '';

    for (const game of Object.values(games)) {
        const btn = document.createElement('button');
        btn.classList.add('game-selector');
        btn.onclick = () => {
            switchGame(game.id);
        };

        const icon = document.createElement('img');
        icon.src = game.icon;
        icon.classList.add('icon');
        icon.style.background = game.color;

        btn.append(icon);

        const name = document.createElement('span');
        name.innerText = game.name;

        btn.append(name);

        container.append(btn);
    }
}

async function navigate(slug, replace = false) {
    const info = parseSlug(slug);

    if (info.category === 'index') {
        info.category = '';
        info.topic = '';
    }

    let path = `/ajax/article/${info.game}/${info.category}/${info.topic}/${info.article}.json`;

    path = path.replaceAll('///', '/').replaceAll('//', '/');

    const req = await fetch(path);

    if (req.status === 404) {
        throw new Error('Page not found');
    }

    const data = await req.json();
    console.log('NAV RESULT', data);

    document.querySelector('.content').innerHTML = data.content;
    if (replace) {
        history.replaceState(slug, '', '/' + slug);
    } else {
        history.pushState(slug, '', '/' + slug);
    }
    document.title = `${data.title} - ${games[info.game].name} Wiki`;
    document.querySelector(
        '.edit a'
    ).href = `https://github.com/ChaosInitiative/Wiki/tree/system-migration/${data.file}`;

    regenerateSidebar(info);
    regenerateNav(info);
    generateGameSelector(info.game);

    updateAllLinkListeners();
}
window.addEventListener('popstate', () => navigate(location.pathname.slice(1), true));
function regenerateSidebar(info) {
    const data = menu[info.game][info.category];
    const container = document.querySelector('.sidebar');
    container.innerHTML = '';

    if (!data) {
        container.innerHTML = 'Nothing to show!';
        return;
    }

    for (const entry of data) {
        const el = document.createElement('a');
        el.id = `sb-${entry.id}`;
        el.innerText = entry.text;
        el.href = '/' + entry.link;
        el.classList.add(entry.type === 'topic' ? 'topic' : 'article');
        const loc = location.pathname.slice(1).replace(/\/$/, '');
        if (entry.link === loc || entry.link === loc + '/index') {
            el.classList.add('active');
        }
        container.append(el);
    }
}
function regenerateNav(info) {
    const data = games[info.game].categories;
    const container = document.querySelector('.categories');
    container.innerHTML = '';
    for (const cat of data) {
        const el = document.createElement('a');
        el.innerText = cat.label;
        el.href = `/${info.game}/${cat.id}/${cat.home}`;
        if (cat.id === info.category) {
            el.classList.add('active');
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
    console.log('GOING TO', e.target.href);
    const url = new URL(e.target.href, location);
    if (url.host === location.host) {
        navigate(url.pathname.slice(1));
    } else {
        window.open(e.target.href, '_blank');
    }
}

async function switchGame(game) {
    const split = location.pathname.slice(1).split('/');
    split[0] = game;
    try {
        await navigate(split.join('/'));
    } catch {
        await navigate(`${game}`);
    }
}

function updateAllLinkListeners() {
    const links = document.querySelectorAll('a');
    for (const link of links) {
        link.onclick = link.href.startsWith('javascript:') ? () => void 0 : linkClickHandler;
    }
}

/**
 * Separates the slug into an easily digestible object
 * @param {string} slug The slug you are trying to parse
 * @returns {{game: string, topic: string, category: string, article: string}}
 */
function parseSlug(slug) {
    const slugParsed = slug.split('/');
    return {
        game: slugParsed[0] || 'index',
        category: slugParsed[1] || 'index',
        topic: slugParsed[2] || 'index',
        article: slugParsed[3] || 'index'
    };
}
