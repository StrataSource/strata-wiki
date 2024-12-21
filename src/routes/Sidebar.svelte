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

    export let menu: MenuCategory[] | undefined = undefined;

    onMount(() => {
        navigating.subscribe(() => {
            $openMenu = false;
        });
    });
</script>

{#if $openMenu}
    <button
        transition:fade={{ duration: 250 }}
        on:click={() => ($openMenu = false)}
        class="nav-bg"
    ></button>
{/if}

<nav
    data-pagefind-ignore="all"
    class:empty={menu === undefined}
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
        {#if menu}
            {#each menu as topic}
                <details open={$page.params.topic == topic.id}>
                    <summary
                        class:active={$page.params.topic == topic.id}
                        class:activeDirect={$page.params.topic == topic.id &&
                            !$page.params.article}
                    >
                        {topic.title}
                    </summary>

                    {#each topic.articles as article}
                        <a
                            class="item"
                            class:active={article.id === $page.params.article}
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
                                        <Icon d={mdiBlockHelper} inline></Icon>
                                    </span>
                                {/if}
                            {/if}
                        </a>
                    {/each}
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
