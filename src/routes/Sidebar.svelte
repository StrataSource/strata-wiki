<script lang="ts">
    import { navigating, page } from "$app/stores";
    import GameSelector from "$lib/components/GameSelector.svelte";
    import SidebarTopic from "./SidebarTopic.svelte";
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
        menu?: MenuTopic[] | undefined;
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
    
    <SidebarTopic menu={menu}></SidebarTopic>
    
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

</style>
