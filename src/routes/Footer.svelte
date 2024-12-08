<script lang="ts">
    import { page } from "$app/stores";
    import Btn from "$lib/components/Btn.svelte";
    import Container from "$lib/components/Container.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Link from "$lib/components/Link.svelte";
    import { mdiHeart } from "@mdi/js";

    const messages = [
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
        "Introducing Funko Pop Wallace!",
        "Another day, another dollar!",
        "Come on Gordon, crank that thing!",
        "Lost to the archives...",
        "Secret Macaron Hack",
        "The sun is leaking",
        "Half-Life 2 confirmed!",
        "Portal 2: Combat Evolved",
        "If found, please return to Strata Team",
    ];

    for (let i = messages.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [messages[i], messages[j]] = [messages[j], messages[i]];
    }

    let messageId = 0;

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
        <button class="motd" on:click={updateMessage}>
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
        border: none;

        cursor: pointer;

        &:hover {
            color: var(--strataBright);
        }
    }
</style>
