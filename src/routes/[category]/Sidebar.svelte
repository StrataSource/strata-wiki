<script lang="ts">
    import { page } from "$app/stores";

    export let menu: MenuCategory[];
</script>

<div class="sidebar">
    <img
        src="https://branding.stratasource.org/i/strata/logo/ondark/color.svg"
        alt="Strata Logo"
        class="logo"
    />
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
                        {article.title}
                    </a>
                {/each}
            </details>
        {/each}
    </div>
</div>

<style lang="scss">
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
