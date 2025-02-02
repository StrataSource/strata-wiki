<script lang="ts">
    import { page } from "$app/stores";


    import og from "$lib/assets/og.png";
    interface Props {
        title: string;
    }

    let { title }: Props = $props();
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
    <meta
        data-pagefind-meta="image_alt:"
        property="og:url"
        content="https://wiki.stratasource.org/{$page.url.pathname}"
    />
    <meta property="og:image" content="https://wiki.stratasource.org/{og}" />
    <meta name="theme-color" content="#f0413c" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title} - Strata Source Wiki" />
    <meta name="twitter:site" content="@stratasource" />
    <meta name="twitter:image" content="https://wiki.stratasource.org/{og}" />
</svelte:head>
