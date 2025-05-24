<script lang="ts">
    import { navigating, page } from "$app/stores";
    import Icon from "$lib/components/Icon.svelte";
    import SidebarTopic from "./SidebarTopic.svelte";
    import {
        currentArticle,
        currentTopic,
        currentGame,
        gameMeta,
        openMenu,
    } from "$lib/stores";
    import { getGamesWithSupport } from "$lib/supportChecker";
    import {
        mdiBlockHelper,
        mdiDelete,
        mdiFlaskEmpty,
        mdiSelectionEllipse,
    } from "@mdi/js";
    import { onMount } from "svelte";

    interface Props {
        menu?: MenuTopic | undefined;
    }

    let { menu = undefined }: Props = $props();

    let loaded = $state(false);

    onMount(() => {
        loaded = true;
        navigating.subscribe(() => {
            $openMenu = false;
        });
    });
</script>

<div class="menu">
    {#if menu}
        {#each menu.subtopics as topic}
            <details open={$currentTopic == topic.id}>
                <summary
                    class:active={$currentTopic == topic.id}
                    class:activeDirect={$currentTopic == topic.id &&
                        !$page.params.article}
                >
                    {topic.title}
                </summary>

                {#if topic.subtopics.length > 0}
                    <SidebarTopic menu={topic}></SidebarTopic>
                {/if}

                {#each topic.articles as article, i}
                    {#if i < 100 || loaded}
                        <a
                            class="item"
                            class:active={article.id === $page.params.article}
                            href="/{topic.id}/{article.id}"
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
                    {/if}
                {/each}

                {#if topic.articles.length > 99 && !loaded}
                    <a class="item" href="/{topic.id}">
                        <div>More...</div>
                    </a>
                {/if}
            </details>
        {/each}
    {/if}
</div>

<style lang="scss">
    .menu {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        padding-left: 1rem;
    }

    :global(nav) > .menu {
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
