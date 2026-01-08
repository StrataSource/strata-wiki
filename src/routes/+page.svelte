<script lang="ts">
    import Container from "$lib/components/Container.svelte";
    import Card from "$lib/components/Card.svelte";

    import heroHeader from "$lib/assets/heroHeader.svg";
    import { // List of material icons that will be used on the Home page.
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

    // The list of categories that are featured on the Wiki home page.
    const categories: (
        | {
              id: string; // The article (without the ".md") that should be entered into by default when the category is selected.
              title: string; // Title displayed for the category.
              description: string; // Description of the category.
              icon: string; // Icon to use for the category displayed before the "title". Recommended to use a icon imported from the material icons package.
              separation: false; // This should be left false for category entrees.
          }
        | { title: string; separation: true; } // Alternate structure for headers separators.
    )[] = [
        /* { separation: true, title: "Getting sSarted" },
        {
            id: "todo",
            title: "Mapping",
            description: "Creating content in Strata Source",
            icon: mdiGridLarge,
            separation: false,
        }, */
        { separation: true, title: "Reference" },
        /* {
            id: "todo",
            title: "Sound Operators",
            description: "List of sound operators",
            icon: mdiVolumeHigh,
            separation: false,
        }, */
        {
            id: "modding/overview",
            title: "Modding",
            description: "Modding Strata Source Games",
            icon: mdiLayers,
            separation: false,
        },
        {
            id: "entities/reference",
            title: "Entities",
            description: "Engine Entity Reference",
            icon: mdiSphere,
            separation: false,
        },
        {
            id: "material/reference",
            title: "Materials",
            description: "Material Reference",
            icon: mdiCubeOutline,
            separation: false,
        },
        {
            id: "lighting/clustered",
            title: "Lighting",
            description: "Lighting Reference",
            icon: mdiLightbulb,
            separation: false,
        },
        {
            id: "audio/overview/overview",
            title: "Audio",
            description: "Audio Reference",
            icon: mdiSpeaker,
            separation: false,
        },
        {
            id: "console/command",
            title: "Console",
            description: "ConCommands & ConVars Reference",
            icon: mdiConsoleLine,
            separation: false,
        },
        {
            id: "misc",
            title: "Misc",
            description: "Miscellaneous Pages",
            icon: mdiDiceMultiple,
            separation: false,
        },
        {
            id: "community",
            title: "Community",
            description: "Community Tools & Resources",
            icon: mdiWrench,
            separation: false,
        },
        { separation: true, title: "Scripting" },
        {
            id: "angelscript/index",
            title: "AngelScript",
            description: "Reference for The AngelScript Scripting System",
            icon: mdiScript,
            separation: false,
        },
        {
            id: "vscript/reference/Globals",
            title: "VScript",
            description: "Reference for the VScript Scripting System",
            icon: mdiAlphaVBox,
            separation: false,
        },
        {
            id: "panorama/overview/getting-started",
            title: "Panorama",
            description: "In-Game UI Framework",
            icon: mdiViewDashboard,
            separation: false,
        } /*
        {
            id: "todo",
            title: "Game Events",
            description: "Documentation for every game event",
            icon: mdiNetwork,
            separation: false,
        },
        { separation: true, title: "Assets" },
        {
            id: "todo",
            title: "Material Proxies",
            description: "Material Proxy Reference",
            icon: mdiCubeScan,
            separation: false,
        },
        {
            id: "todo",
            title: "Animation",
            description: "Maybe?",
            icon: mdiAnimation,
            separation: false,
        },
        {
            id: "todo",
            title: "Model Compilation",
            description: "Compiling and QC files",
            icon: mdiFileDocument,
            separation: false,
        }, */,
        { separation: true, title: "Contributing" },
        {
            id: "contribute/basics/getting-started",
            title: "Contribute to The Wiki",
            description: "How to contribute to the Strata Source Wiki.",
            icon: mdiAccountGroup,
            separation: false,
        },
        {
            id: dev ? "test" : "", // The Test Suite should only appear in local non-production builds of the Wiki.
            title: "Test Suite",
            description: "(Dev Only) Suite for testing the Wiki elements and features.",
            icon: mdiTestTube,
            separation: false,
        },
    ];
</script>

<Metadata title="Home"></Metadata>

<div class="hero" style:--i="url({heroHeader})">
    <Container>
        <div>
            <h1>Welcome to the Strata Source Wiki</h1>
        </div>
    </Container>
</div>

<Container>
    <div class="grid">
        {#each categories as category}
            {#if category.separation}
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
            color: #eee;

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
