<script>
    import GameSelector from "$lib/components/GameSelector.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Link from "$lib/components/Link.svelte";
    import {
        mdiClose,
        mdiHistory,
        mdiMagnify,
        mdiMenu,
        mdiPencil,
    } from "@mdi/js";
    import { page } from "$app/stores";
    import { writable } from "svelte/store";
    import { currentArticle, openMenu } from "$lib/stores";
</script>

<nav>
    <a href="/" class="logo">
        <img
            src="https://branding.stratasource.org/i/strata/logo/ondark/color.svg"
            alt="Strata Logo"
        />
    </a>
    <div class="actions">
        <span class="icons">
            <div class="desktop">
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

            <div class="mobile">
                <button on:click={() => ($openMenu = !$openMenu)}>
                    {#if $openMenu}
                        <Icon d={mdiClose}></Icon>
                    {:else}
                        <Icon d={mdiMenu}></Icon>
                    {/if}
                </button>
            </div>
        </span>
        <div class="desktop">
            <GameSelector></GameSelector>
        </div>
    </div>
</nav>

<style lang="scss">
    nav {
        position: sticky;
        top: 0;
        height: 4rem;
        z-index: 10;

        background-color: #222;
        border-bottom: solid 0.1rem var(--strata);

        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .logo {
        height: 100%;
        width: 18rem;
        text-align: center;

        & img {
            height: calc(100% - 2rem);
            padding: 1rem;
        }

        @media (max-width: 60rem) {
            width: fit-content;
        }
    }

    .actions {
        padding-right: 5rem;

        display: flex;
        align-items: center;
        gap: 0.5rem;

        & .icons {
            font-size: 1.5rem;
            line-height: 1;
        }

        & button {
            font-size: 1em;
            padding: 0;
            border: 0;
            outline: none;
            background: none;
            cursor: pointer;

            transition: 250ms;

            color: var(--strata);

            &:hover {
                color: var(--strataBright);
            }
        }

        & .mobile {
            font-size: 2rem;
            display: none;
        }

        @media (max-width: 60rem) {
            padding-right: 1rem;

            & .desktop {
                display: none;
            }

            & .mobile {
                display: block;
            }
        }
    }
</style>
