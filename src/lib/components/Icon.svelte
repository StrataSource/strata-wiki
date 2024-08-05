<script lang="ts">
    export let d: string;
    export let inline = false;
</script>

<svg viewBox="0 0 24 24" class:inline>
    <path {d} />
</svg>

<style>
    svg {
        height: 1em;
        display: block;
    }

    .inline {
        display: inline;
        vertical-align: middle;
    }

    path {
        fill: currentColor;
    }
</style>
