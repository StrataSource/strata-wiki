<script lang="ts">
    import "@fontsource/lexend-deca";
</script>

<slot></slot>

<style>
    :global(body) {
        background: #111;
        color: #fff;
        font-family: "Lexend Deca";

        margin: 0;

        --caution: #ed1166;
        --warning: #eeb43b;
        --success: #00ba52;
        --info: #7537ff;

        --strata: #f0413c;
        --strataBright: #ef8686;
        --strataDark: #a32b2b;
    }
</style>
