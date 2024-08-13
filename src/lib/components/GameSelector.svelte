<script lang="ts">
    import { currentGame, gameMeta } from "$lib/stores";
</script>

<select class="game" bind:value={$currentGame}>
    <option value="" disabled={$currentGame == ""}>
        {#if $currentGame == ""}
            Select game...
        {:else}
            Disable support info
        {/if}
    </option>
    {#each Object.entries($gameMeta) as [id, game]}
        <option value={id}>{game.name}</option>
    {/each}
</select>

<style>
    .game {
        background-color: #333;
        color: white;
        border: none;
        border-radius: 0.25rem;
        padding: 0.5rem;
        width: 100%;
    }
</style>
