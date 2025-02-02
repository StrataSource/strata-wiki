<script lang="ts">
    interface Props {
        d: string;
        inline?: boolean;
    }

    let { d, inline = false }: Props = $props();
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
