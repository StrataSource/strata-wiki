<script lang="ts">
    import Link from "$lib/components/Link.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

{#each data.categories as category}
    <div>
        <Link href="/{category.id}">{category.title}</Link>
    </div>
{/each}
