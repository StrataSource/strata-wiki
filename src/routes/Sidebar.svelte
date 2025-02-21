<script lang="ts">
    import { navigating, page } from "$app/stores";
    import GameSelector from "$lib/components/GameSelector.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Link from "$lib/components/Link.svelte";
    import {
        currentArticle,
        currentGame,
        gameMeta,
        openMenu,
    } from "$lib/stores";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import {
        mdiBlockHelper,
        mdiDelete,
        mdiFlaskEmpty,
        mdiHistory,
        mdiHome,
        mdiMagnify,
        mdiPencil,
        mdiSelectionEllipse,
    } from "@mdi/js";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        menu?: MenuCategory[] | undefined;
    }

    let { menu = undefined }: Props = $props();

    let actualMenu: MenuCategory[] | undefined = $state(menu);

    let loaded = $state(false);

    const menuCache: { [id: string]: MenuCategory[] } = {};

    let lastCategory = "";

    onMount(async () => {
        $effect(() => {
            if (lastCategory != $page.params.category) {
                lastCategory = $page.params.category;
                actualMenu = menu;
                fetchFullMenu;
            }
        });

        navigating.subscribe(async () => {
            $openMenu = false;
            await fetchFullMenu();
        });
    });

    async function fetchFullMenu() {
        if (!$page.params.category) {
            actualMenu = undefined;
            return;
        }

        if (menuCache[$page.params.category]) {
            actualMenu = menuCache[$page.params.category];
            return;
        }

        const req = await fetch(`/_/menu/${$page.params.category}.json`);
        actualMenu = await req.json();

        if (!actualMenu) {
            return;
        }

        menuCache[$page.params.category] = actualMenu;

        loaded = true;
    }
</script>

{#if $openMenu}
    <button
        aria-label="Close menu"
        transition:fade={{ duration: 250 }}
        onclick={() => ($openMenu = false)}
        class="nav-bg"
    ></button>
{/if}

<nav
    data-pagefind-ignore="all"
    class:empty={actualMenu === undefined}
    class:open={$openMenu}
>
    <div class="mobile">
        <div class="actions">
            <Link href="/" title="Home">
                <Icon d={mdiHome} inline></Icon>
            </Link>
            {#if $page.params.article && $currentArticle && !$currentArticle.disablePageActions}
                <Link
                    href="https://github.com/StrataSource/Wiki/edit/main/docs{$page
                        .url.pathname}.md"
                    title="Edit"
                >
                    <Icon d={mdiPencil} inline></Icon>
                </Link>
                <Link
                    href="https://github.com/StrataSource/Wiki/commits/main/docs{$page
                        .url.pathname}.md"
                    title="History"
                >
                    <Icon d={mdiHistory} inline></Icon>
                </Link>
            {/if}
            <Link href="/search" title="Search">
                <Icon d={mdiMagnify} inline></Icon>
            </Link>
        </div>

        <GameSelector></GameSelector>
    </div>

    <div class="menu">
        {#if actualMenu}
            {#each actualMenu as topic}
                <details open={$page.params.topic == topic.id}>
                    <summary
                        class:active={$page.params.topic == topic.id}
                        class:activeDirect={$page.params.topic == topic.id &&
                            !$page.params.article}
                    >
                        {topic.title}
                    </summary>

                    {#each topic.articles as article, i}
                        {#if i < 100 || loaded}
                            <a
                                class="item"
                                class:active={article.id ===
                                    $page.params.article}
                                href="/{$page.params
                                    .category}/{topic.id}/{article.id}"
                            >
                                <div>{article.meta.title || article.id}</div>

                                {#if article.meta.deprecated}
                                    <span title="Deprecated">
                                        <Icon d={mdiDelete} inline></Icon>
                                    </span>
                                {/if}
                                {#if article.meta.experimental}
                                    <span title="Experimental">
                                        <Icon d={mdiFlaskEmpty} inline></Icon>
                                    </span>
                                {/if}
                                {#if (article.meta?.features?.length || 0) > 0 && !getGamesWithSupport(article.meta.features || []).all}
                                    {#if $currentGame == ""}
                                        <span title="Limited support">
                                            <Icon d={mdiSelectionEllipse} inline
                                            ></Icon>
                                        </span>
                                    {:else if !getGamesWithSupport(article.meta.features || []).games.includes($currentGame)}
                                        <span
                                            title="Unsupported in {$gameMeta[
                                                $currentGame
                                            ].name}"
                                        >
                                            <Icon d={mdiBlockHelper} inline
                                            ></Icon>
                                        </span>
                                    {/if}
                                {/if}
                            </a>
                        {/if}
                    {/each}

                    {#if topic.articles.length > 99 && !loaded}
                        <a
                            class="item"
                            href="/{$page.params.category}/{topic.id}"
                        >
                            <div>More...</div>
                        </a>
                    {/if}
                </details>
            {/each}
        {/if}
    </div>
</nav>

<style lang="scss">
    nav {
        width: 18rem;
        max-width: 100vw;
        height: calc(100vh - 4.1rem);

        position: fixed;
        top: 4.1rem;
        left: 0;
        z-index: 20;

        overflow-y: auto;

        background-color: #222;

        transition: 250ms;

        &.empty {
            display: none;
        }

        @media (max-width: 60rem) {
            display: block !important;
            left: -100vw;

            &.open {
                left: 0;
            }
        }
    }

    .nav-bg {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background-color: #00000060;

        border: none;
        outline: none;
        padding: 0;

        z-index: 5;

        @media (min-width: 60rem) {
            display: none !important;
        }
    }

    .mobile {
        padding: 0.5rem 1rem;

        @media (min-width: 60rem) {
            display: none !important;
        }

        & .actions {
            font-size: 2rem;

            display: flex;
            justify-content: space-between;
            align-items: center;

            padding-bottom: 1rem;
        }
    }

    .menu {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        padding: 0.5rem 1rem;
    }

    .item {
        color: currentColor;
        text-decoration: none;

        display: flex;
        justify-content: space-between;
        gap: 0.25rem;

        border-radius: 0.25rem;

        transition: 250ms;

        padding: 0.1rem;
        padding-left: 1rem;

        &:hover,
        &:focus {
            background-color: #333;
        }

        &.active {
            background-color: var(--strataDark);
        }

        & div {
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }

    summary {
        cursor: pointer;

        &.active {
            font-weight: bold;
        }

        &.activeDirect {
            color: var(--strataBright);
        }
    }
</style>
