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
        border-collapse: collapse;
        border: none;
        text-wrap: nowrap;
    }
    
    tr {
        border-bottom: solid 0.1rem #8882;
    }

    tr:first-child {
        color: #fff;
		font-weight: bold;
    }

    td {
        padding: 0.3rem 0.8rem;
    }
</style>
