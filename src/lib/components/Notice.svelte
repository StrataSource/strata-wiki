<script lang="ts">
    import {
        mdiAlert,
        mdiAlertOctagon,
        mdiBug,
        mdiInformation,
        mdiLightbulbOn,
    } from "@mdi/js";
    import Icon from "./Icon.svelte";
    import { gameMeta } from "$lib/stores";

    interface Props {
        type?: NoticeType;
        icon?: string | undefined;
        title?: string | undefined;
        game?: string;
        children?: import("svelte").Snippet;
    }

    let {
        type = "normal",
        icon = undefined,
        title = undefined,
        game = "",
        children,
    }: Props = $props();

    if (type == "game" && game == "") {
        throw new Error("Notice type is game, but no game is specified!");
    }

    const colorMap = {
        normal: undefined,
        game: undefined,
        caution: "var(--caution)",
        warning: "var(--warning)",
        note: "var(--info)",
        tip: "var(--success)",
        bug: "var(--strata)",
    };

    let color = $state(colorMap[type] || "#333");

    if (type == "game") {
        color = $gameMeta[game].color || (() => color)();
    }
</script>

<div class="notice" style:--c={color}>
    {#if type != "normal"}
        <div class="icon">
            {#if icon}
                <Icon d={icon}></Icon>
            {:else if type == "game"}
                <!-- svelte-ignore a11y_missing_attribute -->
                <img src="/_/icon/{game}.svg" />
            {:else if type == "note"}
                <Icon d={mdiInformation}></Icon>
            {:else if type == "tip"}
                <Icon d={mdiLightbulbOn}></Icon>
            {:else if type == "warning"}
                <Icon d={mdiAlert}></Icon>
            {:else if type == "caution"}
                <Icon d={mdiAlertOctagon}></Icon>
            {:else if type == "bug"}
                <Icon d={mdiBug}></Icon>
            {/if}
        </div>
    {/if}

    <div class="content">
        <div class="title">
            {#if title}
                {title}
            {:else if type == "game"}
                {$gameMeta[game].name} only:
            {:else if type == "note"}
                Note:
            {:else if type == "tip"}
                Tip:
            {:else if type == "warning"}
                Warning:
            {:else if type == "caution"}
                Caution:
            {:else if type == "bug"}
                Bug:
            {/if}
        </div>
        {@render children?.()}
    </div>
</div>

<style lang="scss">
    .notice {
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0.25rem;

        background-color: #222;

        overflow: hidden;

        display: flex;
        gap: 0.5rem;

        border-left: solid var(--c) 0.25rem;
    }

    .icon {
        font-size: 1.5rem;
        padding: 0.5rem;

        height: fit-content;
        width: fit-content;

        background-color: #333;
        color: var(--c);
        border-radius: 50%;

        & img {
            height: 1em;
            display: block;
            aspect-ratio: 1;
        }
    }

    .title {
        color: var(--c);
        font-weight: bold;
    }

    .content {
        width: 100%;
    }
</style>
