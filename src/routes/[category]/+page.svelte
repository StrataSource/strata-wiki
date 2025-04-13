<script lang="ts">
    import { page } from "$app/stores";
    import Link from "$lib/components/Link.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<Metadata title={data.meta.title}></Metadata>

<h1>{data.meta.title}</h1>

{#each data.menu.subtopics as topic}
    <div>
        <Link href="/{topic.id}">{topic.title}</Link>
    </div>
{/each}
