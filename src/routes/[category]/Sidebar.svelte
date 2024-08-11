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
</script>

<nav data-pagefind-ignore="all">
    <div class="menu">
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
    nav {
        width: 18rem;
        height: calc(100vh - 4.1rem);

        position: fixed;
        top: 4.1rem;
        left: 0;

        overflow-y: auto;

        background-color: #222;
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

        display: block;

        border-radius: 0.25rem;

        transition: 250ms;

        padding: 0.1rem;
        padding-left: 1rem;

        text-overflow: ellipsis;
        overflow: hidden;

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
