import { MetaGame, Menu, RenderedPage } from '../common/types';
import { Slug } from '../common/slug';
import { clearNotices, notify } from './notices';
import { anchorHeaderFix, addAnchorLinks } from './anchors';
import { GameSelector } from './gameselector';

let games: { [game: string]: MetaGame } = {};
let menu: Menu = {};
let gameSelector: GameSelector;

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

    gameSelector = new GameSelector();

    //Regenerate UI
    const slug: Slug = getLocationSlug();
    regenerateNav(slug);
    regenerateSidebar(slug);
    gameSelector.regenerate(games);
    updateAllLinkListeners();

    if (params.get('force') === 'gameselect') {
        gameSelector.show(false);
    }

    navigate(slug, true, false);
}
window.addEventListener('load', init);

export async function navigate(slug: Slug, replace = false, loadData = true) {
    console.log(`Navigating to "${slug.toString()}"`);

    const ajaxPath = '/ajax/article/' + slug.toString() + '.json';
    const req = await fetch(ajaxPath);
    if (req.status === 404) {
        console.log(`Could not request AJAX for "${ajaxPath}"!`);
        if (loadData) {
            throw new Error('Page not found');
        }
        return;
    }

    const data: RenderedPage = (await req.json().catch(() => {
        throw new Error('Error parsing page data');
    })) as RenderedPage;
    document.querySelector('#content').innerHTML = data.content;

    //console.log('NAV RESULT', data);

    clearNotices();

    // Grab all of the exclusive blocks and filter 'em
    const exclusives = document.querySelectorAll<HTMLDivElement>('.exclusive');

    if (slug.game === 'shared') {
        // If this is the "shared" game, we want to always display all exclusive blocks
        for (const exclusive of exclusives) {
            exclusive.style.display = 'block';
        }
    } else {
        // Hide any exclusive blocks that aren't related to the current game
        let showExclusiveNotice = false;

        for (const exclusive of exclusives) {
            if (exclusive.className.includes(slug.game)) {
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

    // Change the page's URL to our new slug
    // If we're on an index page, we need to snip off the "index" bit
    const cleanSlug = '/' + slug.toString(true);
    if (replace) {
        history.replaceState(slug, '', cleanSlug);
    } else {
        history.pushState(slug, '', cleanSlug);
    }

    document.querySelector('html').className = 'theme-' + slug.game;

    document.title = `${data.meta.title || 'Page not found'} - ${games[slug.game].name} Wiki`;
    document.querySelector<HTMLDivElement>('#current-game').innerText = games[slug.game].name;

    document.querySelector<HTMLLinkElement>('link[rel=icon]').href = games[slug.game].favicon || games[slug.game].icon;
    document.querySelector<HTMLLinkElement>('link[rel=shortcut]').href =
        games[slug.game].favicon || games[slug.game].icon;

    document.querySelector<HTMLAnchorElement>('.top-nav .game a').href = `/${slug.game}`;

    if (loadData || data.path) {
        // Update the edit button to reflect our current page
        document.querySelector<HTMLAnchorElement>('.edit a').href = `https://github.com/StrataSource/Wiki/edit/main/${
            data.path || '404.md'
        }`;
    }

    regenerateSidebar(slug);
    regenerateNav(slug);
    addAnchorLinks();

    updateAllLinkListeners();
}
window.addEventListener('popstate', () => navigate(getLocationSlug(), true));

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
    const url = new URL(e.target.href, location.toString());
    if (url.host === location.host) {
        document.body.classList.remove('nav-show');

        navigate(new Slug().fromString(url.pathname.slice(1)));

        if (e.currentTarget.parentNode.classList.contains('categories') && e.currentTarget.innerText !== 'Home') {
            document.body.classList.add('nav-showTopics', 'nav-show');
        }
    } else {
        window.open(e.target.href, '_blank');
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
 * Returns the current location as a slug
 */
export function getLocationSlug(): Slug {
    return new Slug().fromString(location.pathname.slice(1));
}
