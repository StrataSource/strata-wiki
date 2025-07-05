<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Card from "$lib/components/Card.svelte";

    import heroHeader from "$lib/assets/heroHeader.svg";
    import {
        mdiAccountGroup,
        mdiAlphaVBox,
        mdiConsoleLine,
        mdiCubeOutline,
        mdiLayers,
        mdiScript,
        mdiSpeaker,
        mdiLightbulb,
        mdiSphere,
        mdiTestTube,
        mdiViewDashboard,
        mdiDiceMultiple,
        mdiWrench,
    } from "@mdi/js";
    import Icon from "$lib/components/Icon.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import { dev } from "$app/environment";

    const categories: (
        | {
              id: string;
              title: string;
              description: string;
              icon: string;
              seperation: false;
          }
        | { title: string; seperation: true }
    )[] = [
        /* { seperation: true, title: "Getting started" },
        {
            id: "todo",
            title: "Mapping",
            description: "Creating content in Strata Source",
            icon: mdiGridLarge,
            seperation: false,
        }, */
        { seperation: true, title: "Reference" },
        /* {
            id: "todo",
            title: "Sound Operators",
            description: "List of sound operators",
            icon: mdiVolumeHigh,
            seperation: false,
        }, */
        {
            id: "modding/overview",
            title: "Modding",
            description: "Modding Strata Source games",
            icon: mdiLayers,
            seperation: false,
        },
        {
            id: "entities/reference",
            title: "Entities",
            description: "Engine Entity Reference",
            icon: mdiSphere,
            seperation: false,
        },
        {
            id: "material/reference",
            title: "Materials",
            description: "Material Reference",
            icon: mdiCubeOutline,
            seperation: false,
        },
        {
            id: "lighting/clustered",
            title: "Lighting",
            description: "Lighting reference",
            icon: mdiLightbulb,
            seperation: false,
        },
        {
            id: "audio/overview/overview",
            title: "Audio",
            description: "Audio Reference",
            icon: mdiSpeaker,
            seperation: false,
        },
        {
            id: "console/command",
            title: "Console",
            description: "ConCommands and ConVars Reference",
            icon: mdiConsoleLine,
            seperation: false,
        },
        {
            id: "misc",
            title: "Misc",
            description: "Miscellaneous Pages",
            icon: mdiDiceMultiple,
            seperation: false,
        },
        {
            id: "community",
            title: "Community",
            description: "Community Tools & Resources",
            icon: mdiWrench,
            seperation: false,
        },
        { seperation: true, title: "Scripting" },
        {
            id: "angelscript/hammer/classes",
            title: "Angelscript",
            description: "Reference for Angelscript language",
            icon: mdiScript,
            seperation: false,
        },
        {
            id: "vscript/reference/Globals",
            title: "VScript",
            description: "Reference for VScript language",
            icon: mdiAlphaVBox,
            seperation: false,
        },
        {
            id: "panorama/overview/getting-started",
            title: "Panorama",
            description: "In-Game UI Framework",
            icon: mdiViewDashboard,
            seperation: false,
        } /* 
        {
            id: "todo",
            title: "Game Events",
            description: "Documentation for every game event",
            icon: mdiNetwork,
            seperation: false,
        },
        { seperation: true, title: "Assets" },
        {
            id: "todo",
            title: "Material Proxies",
            description: "Material Proxy Reference",
            icon: mdiCubeScan,
            seperation: false,
        },
        {
            id: "todo",
            title: "Animation",
            description: "Maybe?",
            icon: mdiAnimation,
            seperation: false,
        },
        {
            id: "todo",
            title: "Model Compilation",
            description: "Compiling and QC files",
            icon: mdiFileDocument,
            seperation: false,
        }, */,
        { seperation: true, title: "Contributing" },
        {
            id: "contribute/basics/getting-started",
            title: "Contribute to the wiki",
            description: "How to write content for the wiki",
            icon: mdiAccountGroup,
            seperation: false,
        },
        {
            id: dev ? "test" : "",
            title: "Test suite",
            description: "(Dev only) Suite for testing the Wiki",
            icon: mdiTestTube,
            seperation: false,
        },
    ];
</script>

<Metadata title="Home"></Metadata>

<div class="hero" style:--i="url({heroHeader})">
    <Container>
        <div>
            <h1>Welcome to the Strata Wiki</h1>
        </div>
    </Container>
</div>

<Container>
    <div class="grid">
        {#each categories as category}
            {#if category.seperation}
                <div class="section">
                    <h2>{category.title}</h2>
                </div>
            {:else if category.id != ""}
                <a href="/{category.id}">
                    <Card>
                        <h3>
                            <span class="i">
                                <Icon d={category.icon} inline></Icon>
                            </span>
                            {category.title}
                        </h3>
                        <div>{category.description}</div>
                    </Card>
                </a>{/if}
        {/each}
    </div>
</Container>

<style lang="scss">
    .hero {
        background-position: center;
        background-size: 50vh;
        background-image: linear-gradient(180deg, #11111111 0%, #111 100%),
            var(--i);

        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;

        min-height: 10rem;
        margin-bottom: 1rem;

        & h1 {
            margin: 0;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media (max-width: 60rem) {
            display: flex !important;
            flex-direction: column;
        }

        & .section {
            grid-column: 1 / 3;

            background-image: linear-gradient(#333, #333);
            background-size: 1rem 0.1rem;
            background-repeat: repeat-x;
            background-position: center;

            margin-top: 1rem;

            & h2 {
                font-size: 1rem;
                background-color: #111;
                width: fit-content;
                padding-right: 0.5rem;

                margin: 0;

                color: #eee;
            }
        }

        & h3 {
            margin: 0;

            & .i {
                color: var(--strata);
            }
        }

        & a {
            text-decoration: none;
            color: currentColor;
        }
    }
</style>
