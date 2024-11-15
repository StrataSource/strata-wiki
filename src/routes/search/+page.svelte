<script lang="ts">
    import { dev } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Container from "$lib/components/Container.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import Notice from "$lib/components/Notice.svelte";
    import { currentGame, gameMeta } from "$lib/stores";
    import {
        mdiBlockHelper,
        mdiDelete,
        mdiFlaskEmpty,
        mdiSelectionEllipse,
    } from "@mdi/js";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import type {
        Pagefind,
        PagefindSearchFragment,
    } from "vite-plugin-pagefind/types";

    let term = writable("");

    let results: PagefindSearchFragment[] = [];

    let loading = 0;

    onMount(async () => {
        //@ts-expect-error
        const pagefind: Pagefind = await import("/pagefind/pagefind.js");
        await pagefind.init();

        term.subscribe(async (v) => {
            console.log(v);

            if (v == "") {
                await goto(`/search`, {
                    replaceState: true,
                    keepFocus: true,
                    noScroll: true,
                });
                return;
            }

            await goto(`?q=${encodeURIComponent(v.trim())}`, {
                replaceState: true,
                keepFocus: true,
                noScroll: true,
            });

            loading++;
            const search = await pagefind.debouncedSearch(v);

            if (!search) {
                loading--;
                return;
            }

            console.log(search);

            results = await Promise.all(
                search.results.slice(0, 30).map((r) => r.data())
            );
            loading--;
            console.log(results);
        });

        if ($page.url.searchParams.has("q")) {
            $term = decodeURIComponent($page.url.searchParams.get("q") || "");
        }
    });
</script>

<Metadata title="Search{$term != '' ? ` for ${$term}` : ''}"></Metadata>

<Container>
    {#if dev}
        <Notice type="warning" title="Dev mode active">
            The search only indexes pages when the site is built. To update it,
            run a build.
        </Notice>
    {/if}

    <h1>Search</h1>

    <input type="text" placeholder="Search..." bind:value={$term} />

    <div class="results">
        {#if $term == ""}
            <div class="center">Type in your query to start searching</div>
        {:else if loading > 0}
            <div class="center">Loading...</div>
        {:else}
            {#each results as result}
                <a href={result.url.slice(0, -5)} class="card">
                    <h3>
                        {result.meta.title}

                        <span>
                            {#if result.meta.deprecated}
                                <span title="Deprecated">
                                    <Icon d={mdiDelete} inline></Icon>
                                </span>
                            {/if}
                            {#if result.meta.experimental}
                                <span title="Experimental">
                                    <Icon d={mdiFlaskEmpty} inline></Icon>
                                </span>
                            {/if}
                            {#if result.meta.support && result.meta.support != "all"}
                                {#if $currentGame == ""}
                                    <span title="Limited Support">
                                        <Icon d={mdiSelectionEllipse} inline
                                        ></Icon>
                                    </span>
                                {:else if !result.meta.support
                                    .split(",")
                                    .includes($currentGame)}
                                    <span
                                        title="Not supported in {$gameMeta[
                                            $currentGame
                                        ].name}"
                                    >
                                        <Icon d={mdiBlockHelper} inline></Icon>
                                    </span>
                                {/if}
                            {/if}
                        </span>
                    </h3>
                    <div>{@html result.excerpt}</div>
                </a>
            {:else}
                <div class="center">We couldn't find anything :(</div>
            {/each}
        {/if}
    </div>
</Container>

<style lang="scss">
    input {
        display: block;
        box-sizing: border-box;
        width: 100%;

        border: none;
        border-radius: 0.25rem;

        background-color: #333;
        color: currentColor;
        outline: none;

        padding: 1rem;
        font-size: 1.5rem;
    }

    .results {
        padding-top: 1rem;

        & h3 {
            margin-bottom: 0;
        }

        & :global(mark) {
            background-color: var(--strataDark);
            color: currentColor;
        }
    }

    .card {
        text-decoration: none;
        color: currentColor;
    }

    .center {
        text-align: center;
    }
</style>
