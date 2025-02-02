<script lang="ts">
    import { page } from "$app/stores";
    import Icon from "$lib/components/Icon.svelte";
    import Link from "$lib/components/Link.svelte";
    import { mdiHeart } from "@mdi/js";

    const messages = $state([
        "Long live the empire!",
        "Strata Rocks!",
        "Portal 2: Wiki Edition",
        "Sixteen Times The Pages",
        "Not to be confused with the Strata Layer",
        "To be confused with the Strata Wiki",
        "Making Source 20% cooler",
        "Works on my machine™",
        "Beware: ambient_generic on premises",
        "Strata Red 500!",
        "Internal Error 404: Wiki Not Found",
        "The end is never the end is never...",
        "It's not a bug, it's a feature!",
        "Working hard or hardly working!",
        "Over scoped and over budget",
        "Another day, another dollar!",
        "Come on Gordon, crank that thing!",
        "Lost to the archives...",
        "Secret Macaron Hack",
        "Half-Life 2 confirmed!",
        "Portal 2: Combat Evolved",
        "If found, please return to Strata Team",
        "sleep(30);",
        "Entity prop_static (-2040.00 -354.09 512.00) leaked!",
        "Oh fiddlesticks, what now?",
        "Node Graph out of date. Rebuilding...",
        "ThreadComputeStaticPropLighting: 1...2...3...4...5...6...7...8...9...",
        "WARNING: Too many light styles on a face at (-81.000000, 1002.000000, -63.750000)",
        "Breaking news: Wallace Wrench has lost his wrench.",
        "Now with up to 46% more bugs!",
    ]);

    for (let i = messages.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [messages[i], messages[j]] = [messages[j], messages[i]];
    }

    let messageId = $state(0);

    function updateMessage() {
        messageId++;

        if (messageId >= messages.length) {
            messageId = 0;
        }
    }
</script>

<footer class:sidebar={$page.params.category}>
    <div>
        &copy;2023-{new Date().getFullYear()}
        <Link href="https://stratasource.org" target="_blank"
            >Strata Source</Link
        > Contributors - <Link
            href="https://github.com/StrataSource/Wiki/blob/main/LICENSE.md"
            >Content License</Link
        >
    </div>

    <div>
        <button class="motd" onclick={updateMessage}>
            <Icon d={mdiHeart}></Icon>
            {messages[messageId]}
        </button>
    </div>
</footer>

<style lang="scss">
    footer {
        background-color: #222;
        width: calc(100% - 4rem);
        margin-top: 2rem;
        padding: 1rem 2rem;

        display: flex;
        justify-content: space-between;
        gap: 1rem;

        @media (max-width: 60rem) {
            width: calc(100% - 2rem) !important;
            margin-left: 0 !important;
            padding: 1rem;

            flex-direction: column;
        }
    }

    .sidebar {
        width: calc(100% - 22rem);
        margin-left: 18rem;
    }

    .motd {
        display: flex;
        gap: 0.25rem;
        align-items: center;

        background-color: transparent;
        color: currentColor;
        padding: 0;

        font-size: 1em;
        font-family: inherit;
        border: none;

        cursor: pointer;

        transition: 250ms;

        &:hover {
            color: var(--strataBright);
        }
    }
</style>
