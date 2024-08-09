<script lang="ts">
    import { gameMeta } from "$lib/stores";
    import type { LayoutData } from "./$types";
    import Sidebar from "./Sidebar.svelte";

    export let data: LayoutData;

    $gameMeta = data.games;
</script>

<div class="wrapper">
    <Sidebar menu={data.menu} games={data.games}></Sidebar>

    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
    .content {
        width: calc(100% - 24rem);
        padding: 2rem;

        margin-left: 20rem;
    }
</style>
