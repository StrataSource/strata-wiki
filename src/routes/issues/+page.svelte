<script lang="ts">
    import { dev } from "$app/environment";
    import Container from "$lib/components/Container.svelte";
    import Link from "$lib/components/Link.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import Notice from "$lib/components/Notice.svelte";
    import type { LintIssue } from "$lib/linter.server";
    import { onMount } from "svelte";

    let lint: { issues: { [id: string]: LintIssue }; timestamp: number };

    onMount(async () => {
        lint = await (await fetch("/report.json")).json();
    });
</script>

<Metadata title="Issues"></Metadata>

<Container>
    {#if dev}
        <Notice type="warning" title="Dev mode active">
            This report list only updates when the site is built. To update it,
            run a build.
        </Notice>
    {/if}

    <h1>Issues</h1>

    <h2>What is this?</h2>
    <div>
        This page automatically collects and displays sections on the Wiki that
        aren't up to standard. It helps contributors track down pages that need
        fixing in order to ensure a fluid user experience.
    </div>

    {#if !lint}
        <div>Loading report...</div>
    {:else}
        <div>
            The last automated check was on {new Date(
                lint.timestamp
            ).toLocaleString()}, where the system has found
            <strong> {Object.values(lint.issues).length} unique issues </strong>
            on the Wiki.
        </div>

        <h2>Report</h2>

        {#each Object.entries(lint.issues).sort((a, b) => {
            const level = { caution: 3, warning: 2, note: 1 };

            if (a[1].level != b[1].level) {
                return level[b[1].level] - level[a[1].level];
            }

            return b[1].links.length - a[1].links.length;
        }) as [id, issue]}
            <Notice type={issue.level} title={issue.message}>
                {#if issue.links.length == 1}
                    Found on <Link href="/{issue.links[0]}"
                        >/{issue.links[0]}</Link
                    >
                {:else}
                    <details>
                        <summary>Found on {issue.links.length} pages</summary>
                        <ol>
                            {#each issue.links as link}
                                <li>
                                    <Link href="/{link}">/{link}</Link>
                                </li>
                            {/each}
                        </ol>
                    </details>
                {/if}
            </Notice>
        {/each}
    {/if}
</Container>

<style>
    h1 {
        margin-bottom: 0.5rem;
    }
</style>
