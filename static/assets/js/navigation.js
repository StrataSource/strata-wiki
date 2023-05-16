let games = {};
let menu = {};

let params = new URLSearchParams(location.search);
/**
 * Downloads data needed for AJAX nav and initialize it
 */
async function init() {
    updateAllLinkListeners();
    const gameReq = await fetch('/ajax/games.json');
    games = await gameReq.json();
    const menuReq = await fetch('/ajax/menu.json');
    menu = await menuReq.json();

    let dialogCloseBtns = document.querySelectorAll('dialog .close');
    for (const btn of dialogCloseBtns) {
        btn.addEventListener('click', () => btn.parentElement.close());
    }

    //Regenerate UI
    const info = parseSlug(location.pathname.slice(1));
    regenerateNav(info);
    regenerateSidebar(info);
    generateGameSelector(info.game);
    updateAllLinkListeners();

    if (params.get('force') === 'gameselect') {
        showGameSelector(false);
    }

    navigate(location.pathname.slice(1), true, false);
}
window.addEventListener('load', init);

function generateGameSelector(_current) {
    const container = document.querySelector('.games');
    container.innerHTML = '';

    for (const game of Object.values(games)) {
        const btn = document.createElement('button');
        btn.classList.add('game-selector', 'btn');
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
function showGameSelector(closeable = true) {
    document.querySelector('#gameSelector .close').style.display = closeable ? 'block' : 'none';
    document.querySelector('#gameSelector').showModal();
}

async function navigate(slug, replace = false, loadData = true) {
    const info = parseSlug(slug);

    if (info.category === 'index') {
        info.category = '';
        info.topic = '';
    }

    let path = `/ajax/article/${info.game}/${info.category}/${info.topic}/${info.article}.json`;

    path = path.replaceAll('///', '/').replaceAll('//', '/');

    const req = await fetch(path);

    if (req.status === 404 && loadData) {
        throw new Error('Page not found');
    }

    const data = await req.json().catch(() => {
        throw new Error('Error parsing page data');
    });
    document.querySelector('#content').innerHTML = data.content;

    console.log('NAV RESULT', data);

    clearNotices();

    const exclusives = document.querySelectorAll('.exclusive');
    let showExclusiveNotice = false;

    for (const exclusive of exclusives) {
        if (!exclusive.className.includes(info.game)) {
            exclusive.remove();
            showExclusiveNotice = true;
        }
    }
    if (showExclusiveNotice) {
        notify(
            `This page contains sections that are irrelevant to your selected game. If you're missing a section, consider <a href="javascript:showGameSelector()">changing your game</a>.`,
            'eye-off'
        );
    }

    if (data.meta.example) {
        notify(
            `There's a sample for this article. You can <a href="https://github.com/StrataSource/samples/tree/main${data.meta.example}">get it here</a>.`,
            'cube-outline'
        );
    }

    if (replace) {
        history.replaceState(slug, '', '/' + slug);
    } else {
        history.pushState(slug, '', '/' + slug);
    }

    document.querySelector('html').className = 'theme-' + info.game;

    document.title = `${data.title || 'Page not found'} - ${games[info.game].name} Wiki`;
    document.querySelector('#current-game').innerText = games[info.game].name;

    if (loadData || data.file) {
        document.querySelector('.edit a').href = `https://github.com/StrataSource/Wiki/edit/system-migration/${
            data.file ? data.file.slice(6) : '404.md'
        }`;
    }

    regenerateSidebar(info);
    regenerateNav(info);
    generateGameSelector(info.game);

    updateAllLinkListeners();
}
window.addEventListener('popstate', () => navigate(location.pathname.slice(1), true));

function regenerateSidebar(info) {
    const data = menu[info.game][info.category];
    const container = document.querySelector('.sidebar .inner');
    container.innerHTML = '';

    if (!data) {
        container.innerHTML = '<h2>Sections will appear here</h2><div>Select a category to get started</div>';
        container.parentElement.classList.add('empty');
        return;
    }
    container.parentElement.classList.remove('empty');

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
    const data = [
        {
            label: 'Home',
            id: ''
        },
        ...games[info.game].categories
    ];
    const container = document.querySelector('.categories');
    container.innerHTML = '';

    for (const cat of data) {
        const el = document.createElement('a');
        el.innerText = cat.label;
        if (cat.redirect) {
            el.href = cat.redirect;
        } else if (cat.id === '') {
            el.href = `/${info.game}`;
        } else {
            el.href = `/${info.game}/${cat.id}/${cat.home}`;
        }
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
    document.querySelector('#gameSelector').close();
    document.querySelector('#gameSelector .close').style.display = '';

    const split = location.pathname.slice(1).split('/');
    split[0] = game;
    try {
        await navigate(split.join('/'));
    } catch {
        await navigate(game);
        notify('This page does not exist for this game, so we put you on the homepage.', 'file-document-remove');
    }
}

function updateAllLinkListeners() {
    const links = document.querySelectorAll('a');
    for (const link of links) {
        if (link.classList.contains('no-nav')) {
            continue;
        }
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
