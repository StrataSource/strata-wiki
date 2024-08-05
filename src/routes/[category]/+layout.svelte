<script lang="ts">
    import type { LayoutData } from "./$types";
    import Sidebar from "./Sidebar.svelte";

    export let data: LayoutData;
</script>

<div class="wrapper">
    <Sidebar menu={data.menu}></Sidebar>

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
