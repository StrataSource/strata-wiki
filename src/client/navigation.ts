import { MetaGame, Menu, RenderedPage } from '../common/types';
import { Slug } from '../common/slug';
import { clearNotices, notify } from './notices';
import { anchorHeaderFix, addAnchorLinks } from './anchors';

let games: { [game: string]: MetaGame } = {};
let menu: Menu = {};

const params = new URLSearchParams(location.search);
/**
 * Downloads data needed for AJAX nav and initialize it
 */
async function init() {
    updateAllLinkListeners();
    const gameReq = await fetch('/ajax/games.json');
    games = (await gameReq.json()) as { [game: string]: MetaGame };
    const menuReq = await fetch('/ajax/menu.json');
    menu = await menuReq.json();

    // Hook up the game selector's close button
    const dialogCloseBtns = document.querySelectorAll<HTMLButtonElement>('dialog .close');
    for (const btn of dialogCloseBtns) {
        btn.addEventListener('click', () => (btn.parentElement as HTMLDialogElement).close());
    }

    // Wire up the game selector button
    const showBtns = document.querySelectorAll<HTMLButtonElement>('.show-game-selector');
    for (const btn of showBtns) {
        btn.addEventListener('click', () => showGameSelector());
    }

    //Regenerate UI
    const info: Slug = parseSlug(location.pathname.slice(1));
    regenerateNav(info);
    regenerateSidebar(info);
    generateGameSelector();
    updateAllLinkListeners();

    if (params.get('force') === 'gameselect') {
        showGameSelector(false);
    }

    navigate(location.pathname.slice(1), true, false);
}
window.addEventListener('load', init);

function generateGameSelector() {
    // Grab and clear the selector container
    const container = document.querySelector('.games');
    container.innerHTML = '';

    // Generate a button for each game
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
    document.querySelector<HTMLButtonElement>('#gameSelector .close').style.display = closeable ? 'block' : 'none';
    document.querySelector<HTMLDialogElement>('#gameSelector').showModal();
}
function hideGameSelector() {
    document.querySelector<HTMLDialogElement>('#gameSelector').close();
    document.querySelector<HTMLButtonElement>('#gameSelector .close').style.display = '';
}

async function navigate(slug, replace = false, loadData = true) {
    const info: Slug = parseSlug(slug);

    const path = '/ajax/article/' + info.toString() + '.json';
    const req = await fetch(path);

    if (req.status === 404) {
        if (loadData) {
            throw new Error('Page not found');
        }
        return;
    }

    const data: RenderedPage = (await req.json().catch(() => {
        throw new Error('Error parsing page data');
    })) as RenderedPage;
    document.querySelector('#content').innerHTML = data.content;

    console.log('NAV RESULT', data);

    clearNotices();

    // Grab all of the exclusive blocks and filter 'em
    const exclusives = document.querySelectorAll<HTMLDivElement>('.exclusive');

    if (info.game === 'shared') {
        // If this is the "shared" game, we want to always display all exclusive blocks
        for (const exclusive of exclusives) {
            exclusive.style.display = 'block';
        }
    } else {
        // Hide any exclusive blocks that aren't related to the current game
        let showExclusiveNotice = false;

        for (const exclusive of exclusives) {
            if (exclusive.className.includes(info.game)) {
                exclusive.style.display = 'block';
            } else {
                showExclusiveNotice = true;
            }
        }

        if (showExclusiveNotice) {
            notify(
                `This page contains sections that are irrelevant to your selected game. If you're missing a section, consider <a href="?force=gameselect">changing your game</a>.`,
                'eye-off'
            );
        }
    }

    if (data.meta.example) {
        notify(
            `There's a sample for this article. You can <a href="https://github.com/StrataSource/sample-content/tree/main${data.meta.example}">get it here</a>.`,
            'cube-outline'
        );
    }

    if (location.hash) {
        anchorHeaderFix();
    }

    if (replace) {
        history.replaceState(slug, '', '/' + slug);
    } else {
        history.pushState(slug, '', '/' + slug);
    }

    document.querySelector('html').className = 'theme-' + info.game;

    document.title = `${data.meta.title || 'Page not found'} - ${games[info.game].name} Wiki`;
    document.querySelector<HTMLDivElement>('#current-game').innerText = games[info.game].name;

    document.querySelector<HTMLLinkElement>('link[rel=icon]').href = games[info.game].favicon || games[info.game].icon;
    document.querySelector<HTMLLinkElement>('link[rel=shortcut]').href =
        games[info.game].favicon || games[info.game].icon;

    document.querySelector<HTMLAnchorElement>('.top-nav .game a').href = `/${info.game}`;

    if (loadData || data.path) {
        // Update the edit button to reflect our current page
        document.querySelector<HTMLAnchorElement>('.edit a').href = `https://github.com/StrataSource/Wiki/edit/main/${
            data.path || '404.md'
        }`;
    }

    regenerateSidebar(info);
    regenerateNav(info);
    generateGameSelector();
    addAnchorLinks();

    updateAllLinkListeners();
}
window.addEventListener('popstate', () => navigate(location.pathname.slice(1), true));

function regenerateSidebar(info: Slug) {
    const data = menu[info.game][info.category];
    const container = document.querySelector('.sidebar .inner');
    container.innerHTML = '';

    if (!data) {
        container.innerHTML = '<h2>Sections will appear here</h2><div>Select a category to get started</div>';
        container.parentElement.classList.add('empty');
        return;
    }
    container.parentElement.classList.remove('empty');

    for (const topic of data) {
        // Add the element for the topic
        const elTopic = document.createElement('a');
        elTopic.id = `sb-${topic.id}`;
        elTopic.innerText = topic.name;
        elTopic.href = '/' + topic.link;
        elTopic.classList.add('topic');
        const locTopic = location.pathname.slice(1).replace(/\/$/, '');
        if (topic.link === locTopic || topic.link === locTopic + '/index') {
            elTopic.classList.add('active');
        }
        container.append(elTopic);

        // Create the container for the articles
        const divTopic = document.createElement('div');
        divTopic.classList.add('article-list');
        container.append(divTopic);

        for (const article of topic.articles) {
            // Add the element for the article
            const elArticle = document.createElement('a');
            elArticle.id = `sb-${article.id}`;
            elArticle.innerText = article.name;
            elArticle.href = '/' + article.link;
            elArticle.classList.add('article');
            const loc = location.pathname.slice(1).replace(/\/$/, '');
            if (article.link === loc || article.link === loc + '/index') {
                elArticle.classList.add('active');
            }
            divTopic.append(elArticle);
        }
    }
}

function regenerateNav(info: Slug) {
    // Grab the nav container. We'll fill it up with anchors for the given game
    const container = document.querySelector('.categories');
    container.innerHTML = '';

    // Add the Home anchor separately, as it's not in our category list.
    const homeAnchor = document.createElement('a');
    homeAnchor.innerText = 'Home';
    homeAnchor.href = `/${info.game}`;
    container.append(homeAnchor);

    // Add all game category anchors
    for (const cat of games[info.game].categories) {
        const el = document.createElement('a');
        el.innerText = cat.label;

        // Set it to use the redirect if possible, otherwise use the slug
        el.href = cat.redirect ?? `/${info.game}/${cat.id}/${cat.home}`;

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
    console.log('GOING TO', e.target.href, 'EVENT:', e);
    const url = new URL(e.target.href, location.toString());
    if (url.host === location.host) {
        document.body.classList.remove('nav-show');

        navigate(url.pathname.slice(1));

        if (e.currentTarget.parentNode.classList.contains('categories') && e.currentTarget.innerText !== 'Home') {
            document.body.classList.add('nav-showTopics', 'nav-show');
        }
    } else {
        window.open(e.target.href, '_blank');
    }
}

async function switchGame(game) {
    hideGameSelector();

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
    // Override the behavior of all anchors
    const links = document.querySelectorAll('a');
    for (const link of links) {
        // Ignore any anchors with no-nav
        if (link.classList.contains('no-nav')) continue;

        // Don't override any existing on clicks
        if (link.onclick !== null) continue;

        link.onclick = link.href.startsWith('javascript:') ? () => void 0 : linkClickHandler;
    }
}

/**
 * Separates the slug into an easily digestible object
 * @param {string} slug The slug you are trying to parse
 * @returns {{game: string, topic: string, category: string, article: string}}
 */
function parseSlug(slug: string): Slug {
    const slugParsed = slug.split('/');
    return new Slug(slugParsed[0], slugParsed[1], slugParsed[2], slugParsed[3]);
}
