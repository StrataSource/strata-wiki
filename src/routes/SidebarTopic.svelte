<script lang="ts">
    import { page, navigating } from "$app/state";
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
        mdiCircle,
        mdiCircleHalfFull,
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
        $effect(() => {
            if (navigating.to) {
                $openMenu = false;
            }
        });
    });

    const filterArticles = (articles: MenuArticle[]) => articles.filter((a) => !a.meta.hidden);
</script>

<div class="menu">
    {#if menu}
        {#each menu.subtopics as topic}
            <details open={$currentTopic?.startsWith(topic.id)}>
                <summary
                    class:active={$currentTopic?.startsWith(topic.id)}
                    class:activeDirect={$currentTopic?.startsWith(topic.id) &&
                        !page.params.article}
                >
                    {topic.title}
                </summary>

                {#if topic.subtopics.length > 0}
                    <SidebarTopic menu={topic}></SidebarTopic>
                {/if}

                {#each filterArticles(topic.articles) as article, i}

                    {#if i < 100 || loaded}
                        <a
                            class="item"
                            class:active={`${topic.id.slice(page.params.category.length + 1)}/${article.id}` ===
                                page.params.article}
                            href="/{topic.id}/{article.id}"
                        >
                            <div class="article-name">
                                {article.meta.title || article.id}
                            </div>

                            <div class="article-tags">
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

                                {#if article.meta.scope}
                                    {#if article.meta.scope == "shared"}
                                        <span title="Server and Client">
                                            <Icon d={mdiCircle} inline></Icon>
                                        </span>
                                    {:else if article.meta.scope == "server"}
                                        <span title="Server">
                                            <Icon d={mdiCircleHalfFull} inline></Icon>
                                        </span>
                                    {:else if article.meta.scope == "client"}
                                        <span title="Client">
                                            <Icon d={mdiCircleHalfFull} mirror inline></Icon>
                                        </span>
                                    {/if}
                                {/if}
                            </div>
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
			color: #fff;
        }

        .article-name {
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .article-tags {
            text-wrap: nowrap;
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
