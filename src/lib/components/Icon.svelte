<script lang="ts">
    interface Props {
        d: string;
        inline?: boolean;
        mirror?: boolean;
    }

    let { d, inline = false, mirror = false }: Props = $props();
</script>

<svg viewBox="0 0 24 24" class:inline class:mirror>
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

    .mirror {
        transform: scale(-1, 1);
    }

    path {
        fill: currentColor;
    }
</style>
