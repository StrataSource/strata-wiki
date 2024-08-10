<script lang="ts">
    import { page } from "$app/stores";

    export let title: string;
</script>

<svelte:head>
    <title>{title} - Strata Source Wiki</title>
    <meta property="og:type" content="article" />
    <meta
        data-pagefind-meta="title[content], image:"
        property="og:title"
        content={title}
    />
    <meta
        data-pagefind-meta="image_alt:"
        property="og:url"
        content="https://wiki.stratasource.org/{$page.url.pathname}"
    />
</svelte:head>
