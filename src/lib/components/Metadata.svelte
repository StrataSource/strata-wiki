<script lang="ts">
    import { page } from "$app/stores";

    export let title: string;

    import og from "$lib/assets/og.png";
</script>

<svelte:head>
    <title>{title} - Strata Source Wiki</title>
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Strata Wiki" />
    <meta
        data-pagefind-meta="title[content], image:"
        property="og:title"
        content={title}
    />
    <meta
        data-pagefind-meta="image_alt:"
        property="og:url"
        content="https://wiki.stratasource.org{$page.url.pathname}"
    />
    <meta property="og:image" content="https://wiki.stratasource.org{og}" />
    <meta name="theme-color" content="#f0413c" />
</svelte:head>
