<script lang="ts">
    import { page } from "$app/stores";
    import Link from "$lib/components/Link.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<h1>{data.meta.title}</h1>

{#each data.menu.articles as article}
    <div>
        <Link href="/{$page.params.category}/{$page.params.topic}/{article.id}"
            >{article.title}</Link
        >
    </div>
{/each}
