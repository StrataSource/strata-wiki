<script lang="ts">
    import { page } from "$app/stores";
    import Icon from "$lib/components/Icon.svelte";
    import { currentGame, gameMeta } from "$lib/stores";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import {
        mdiBlockHelper,
        mdiDelete,
        mdiFlaskEmpty,
        mdiSelectionEllipse,
    } from "@mdi/js";

    export let menu: MenuCategory[];
    export let games: GameMetaCollection;
</script>

<nav class="sidebar" data-pagefind-ignore="all">
    <img
        src="https://branding.stratasource.org/i/strata/logo/ondark/color.svg"
        alt="Strata Logo"
        class="logo"
    />
    <div class="menu">
        <select class="game" bind:value={$currentGame}>
            <option value="" disabled={$currentGame == ""}>
                {#if $currentGame == ""}
                    Select game...
                {:else}
                    No game
                {/if}
            </option>
            {#each Object.entries(games) as [id, game]}
                <option value={id}>{game.name}</option>
            {/each}
        </select>
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
                        href="/{$page.params.category}/{topic.id}/{article.id}"
                    >
                        {article.meta.title || article.id}

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
                                    <Icon d={mdiSelectionEllipse} inline></Icon>
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
    </div>
</nav>

<style lang="scss">
    .game {
        background-color: #333;
        color: white;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem;
    }

    .sidebar {
        width: 18rem;
        height: 100vh;

        position: fixed;
        top: 0;
        left: 0;

        overflow-y: auto;

        background-color: #222;
    }

    .logo {
        padding: 1rem;
    }

    .menu {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        padding: 0 1rem;
    }

    .item {
        color: currentColor;
        text-decoration: none;

        display: block;

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
    }

    summary {
        &.active {
            font-weight: bold;
        }

        &.activeDirect {
            color: var(--strataBright);
        }
    }
</style>
