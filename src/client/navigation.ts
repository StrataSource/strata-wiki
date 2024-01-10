import { Menu, RenderedPage } from '../common/types';
import { Slug } from '../common/slug';
import { clearNotices, notify } from './notices';
import { anchorHeaderFix, addAnchorLinks } from './anchors';
import { GameSelector } from './gameselector';

let menu: Menu = { games: {} };
let gameSelector: GameSelector;

const params = new URLSearchParams(location.search);
/**
 * Downloads data needed for AJAX nav and initialize it
 */
async function init() {
    updateAllLinkListeners();
    const menuReq = await fetch('/ajax/menu.json');
    menu = await menuReq.json();

    gameSelector = new GameSelector();

    //Regenerate UI
    const slug: Slug = getLocationSlug();
    regenerateNav(slug);
    regenerateSidebar(slug);
    gameSelector.regenerate(menu.games);
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

    const menuGame = menu.games[slug.game];
    document.title = `${data.meta.title || 'Page not found'} - ${menuGame.name} Wiki`;
    document.querySelector<HTMLDivElement>('#current-game').innerText = menuGame.name;

    document.querySelector<HTMLLinkElement>('link[rel=icon]').href = menuGame.icon;
    document.querySelector<HTMLLinkElement>('link[rel=shortcut]').href = menuGame.icon;

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
    const data = menu.games[info.game].categories[info.category];
    const container = document.querySelector('.sidebar .inner');
    container.innerHTML = '';

    if (!data) {
        container.innerHTML = '<h2>Sections will appear here</h2><div>Select a category to get started</div>';
        container.parentElement.classList.add('empty');
        return;
    }
    container.parentElement.classList.remove('empty');

    for (const [topicID, topic] of Object.entries(data.topics)) {
        const topicSlug = new Slug(info.game, info.category, topicID);
        const topicLink = topicSlug.toString(true);

        // Add the element for the topic
        const elTopic = document.createElement('a');
        elTopic.id = `sb-${topicID}`;
        elTopic.innerText = topic.name;
        elTopic.href = '/' + topicLink;
        elTopic.classList.add('topic');
        const locTopic = location.pathname.slice(1).replace(/\/$/, '');
        if (topicLink === locTopic) {
            elTopic.classList.add('active');
        }
        container.append(elTopic);

        // Create the container for the articles
        const divTopic = document.createElement('div');
        divTopic.classList.add('article-list');
        container.append(divTopic);

        // Add each article in the topic
        for (const [articleID, article] of Object.entries(topic.articles)) {
            const articleSlug = new Slug(info.game, info.category, topicID, articleID);
            const articleLink = articleSlug.toString(true);

            // Add the element for the article
            const elArticle = document.createElement('a');
            elArticle.id = `sb-${articleID}`;
            elArticle.innerText = article.name;
            elArticle.href = '/' + articleLink;
            elArticle.classList.add('article');
            const loc = location.pathname.slice(1).replace(/\/$/, '');
            if (articleLink === loc) {
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
    for (const [categoryID, category] of Object.entries(menu.games[info.game].categories)) {
        const el = document.createElement('a');
        el.innerText = category.name;

        // Set it to use the redirect if possible, otherwise use the slug
        el.href = category.redirect ?? `/${info.game}/${categoryID}/${category.home}`;

        if (categoryID === info.category) {
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

        navigate(Slug.fromString(url.pathname.slice(1)));

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
    return Slug.fromString(location.pathname.slice(1));
}
