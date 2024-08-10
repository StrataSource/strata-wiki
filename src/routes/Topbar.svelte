<script>
    import GameSelector from "$lib/components/GameSelector.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Link from "$lib/components/Link.svelte";
    import { mdiHistory, mdiMagnify, mdiPencil } from "@mdi/js";
    import Layout from "./+layout.svelte";
    import { page } from "$app/stores";
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
            {#if $page.params.article}
                <Link href="/todo" title="Edit">
                    <Icon d={mdiPencil} inline></Icon>
                </Link>
                <Link href="/todo" title="History">
                    <Icon d={mdiHistory} inline></Icon>
                </Link>
            {/if}
            <Link href="/search" title="Search">
                <Icon d={mdiMagnify} inline></Icon>
            </Link>
        </span>
        <GameSelector></GameSelector>
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
    }
</style>
