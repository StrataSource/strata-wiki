<script lang="ts">
    import { page } from "$app/stores";

    export let title: string;

    import og from "$lib/assets/og.png";
</script>

<svelte:head>
    <title>{title} - Strata Source Wiki</title>
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Strata Source Wiki" />
    <meta
        data-pagefind-meta="title[content], image:"
        property="og:title"
        content={title}
    />
    <!--TODO-->
    <meta
        data-pagefind-meta="image_alt:"
        property="og:url"
        content="https://more-than-2-less-than-4.wiki-5tv.pages.dev{$page.url
            .pathname}"
    />
    <!--TODO-->
    <meta
        property="og:image"
        content="https://more-than-2-less-than-4.wiki-5tv.pages.dev{og}"
    />
    <meta name="theme-color" content="#f0413c" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title} - Strata Source Wiki" />
    <meta name="twitter:site" content="@stratasource" />
    <!--TODO-->
    <meta
        name="twitter:image"
        content="https://more-than-2-less-than-4.wiki-5tv.pages.dev{og}"
    />
</svelte:head>
