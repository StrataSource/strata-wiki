<script lang="ts">
    import type { Table } from "mdast";
    import { page } from "$app/stores";
    import StringRenderer from "./StringRenderer.svelte";

    interface Props {
        dat: Table;
    }

    let { dat }: Props = $props();
</script>

<div class="wrapper">
    <table>
        <tbody>
            {#each dat.children as row}
                <tr>
                    {#each row.children as cell, i}
                        <td
                            style:text-align={dat.align
                                ? dat.align[i]
                                : undefined}
                        >
                            <StringRenderer dat={cell.children}
                            ></StringRenderer>
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .wrapper {
        max-width: 100%;
        overflow-x: auto;
        display: flex;
    }

    table {
        border-spacing: 0;
        border: solid 0.05rem #333;

        text-wrap: nowrap;
    }

    td {
        border: solid 0.05rem #333;
        padding: 0.5rem 1rem;
    }
</style>
