<script lang="ts">
    import type { Code } from "mdast";

    import hljs from "highlight.js";
    import "highlight.js/styles/felipec.min.css";
    import Icon from "../Icon.svelte";
    import { mdiCheck, mdiContentCopy } from "@mdi/js";
    import "@fontsource/source-code-pro";

    interface Props {
        dat: Code;
    }

    let { dat }: Props = $props();

    // If the code block has a ":: somefilename.txt", add it as a little header
    const codeFilename = dat.meta?.startsWith('::') ? dat.meta.slice(3) : null;

    if (dat.lang == "kv" || dat.lang == "vdf") {
        hljs.registerLanguage("kv", (hljs) => ({
            name: "KeyValues",
            aliases: ["kv", "vdf"],

            contains: [
                {
                    scope: "keyword",
                    begin: /(#(include|base))/,
                    end: /\W/,
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    scope: "string",
                    begin: /(\w)/,
                    end: /[\n ]/,
                    contains: [hljs.BACKSLASH_ESCAPE],
                },
                {
                    scope: "string",
                    begin: /"/,
                    end: /"/,
                    contains: [hljs.BACKSLASH_ESCAPE],
                },
                {
                    scope: "meta",
                    begin: /\[/,
                    end: /]/,
                    contains: [
                        {
                            scope: "symbol",
                            begin: /\$/,
                            end: /(?=(\W))/,
                        },
                    ],
                },
            ],
        }));
    }

    if (dat.lang == "squirrel" || dat.lang == "sq") {
        hljs.registerLanguage("squirrel", (hljs) => {
            let VERBATIM_STRING;
            let HASH_COMMENT;
            return {
                name: "Squirrel",
                aliases: ["squirrel", "sq"],

                keywords: {
                    keyword:
                        "base break case catch class clone continue const default delete else enum extends for foreach function if in local resume return switch this throw try typeof while yield constructor instanceof static __LINE__ __FILE__ rawcall",
                    literal: "true false null",
                },

                contains: [
                    hljs.QUOTE_STRING_MODE,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    hljs.C_NUMBER_MODE,
                    {
                        match: /__LINE__|__FILE__/,
                        scope: "variable.language",
                    },
                    (VERBATIM_STRING = {
                        scope: "string",
                        begin: /@"/,
                        end: /"/,
                        contains: [hljs.BACKSLASH_ESCAPE],
                    }),
                    (HASH_COMMENT = {
                        scope: "comment",
                        begin: /#/,
                        end: /$/,
                    }),
                    {
                        match: [/\b(class)/, /\s+/, /[A-Z_a-z]\w*/],
                        scope: {
                            1: "keyword",
                            3: "title.class",
                        },
                    },
                    {
                        match: [/\b(extends)/, /\s+/, /[A-Z_a-z]\w*/],
                        scope: {
                            1: "keyword",
                            3: "title.class.inherited",
                        },
                    },
                    {
                        beginKeywords: "function constructor",
                        end: /{/,
                        excludeEnd: true,
                        illegal: /\S/,
                        contains: [
                            {
                                begin: /\(/,
                                end: /\)/,
                                contains: [
                                    hljs.APOS_STRING_MODE,
                                    hljs.QUOTE_STRING_MODE,
                                    hljs.C_LINE_COMMENT_MODE,
                                    hljs.C_BLOCK_COMMENT_MODE,
                                    VERBATIM_STRING,
                                    HASH_COMMENT,
                                ],
                            },
                            {
                                scope: "title.function",
                                begin: /[A-Z_a-z]\w*/,
                            },
                        ],
                    },
                ],
            };
        });
    }

    let copySuccess = $state(0);

    function copy() {
        navigator.clipboard.writeText(dat.value);

        copySuccess++;

        setTimeout(() => {
            copySuccess--;
        }, 1000);
    }
</script>

{#if codeFilename}
<div class="code-header">
    <span>{codeFilename}</span>
</div>
{/if}
<div class="wrapper" class:has-header={codeFilename}>
    <div class="actions">
        <button onclick={copy} title="Copy code">
            {#if copySuccess > 0}
                <Icon d={mdiCheck}></Icon>
            {:else}
                <Icon d={mdiContentCopy}></Icon>
            {/if}
        </button>
    </div>
    <div class="code">
        {@html hljs.highlight(dat.value, { language: dat.lang || "text" })
            .value}
    </div>
</div>

<style lang="scss">
    $font: 'Source Code Pro', monospace;
    $radius: 0.25rem;

    .code-header {
        border-radius: $radius $radius 0 0;
        padding: 0.4rem 1rem;
        width: fit-content;
        
        background-color: #222;
        color: #aaa;

        font-family: $font;
        font-size: 0.8em;
    }

    .wrapper {
        margin-bottom: 1.0rem;
        border-radius: $radius;
        width: 100%;
        position: relative;
        background-color: #333;

        &.has-header {
            border-top-left-radius: 0;
        }
    }

    .code {
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        font-family: $font;
        tab-size: 4;
    }

    .actions {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        opacity: 0;

        transition: 250ms;

        & button {
            background-color: transparent;
            border: none;
            outline: none;
            color: currentColor;
            cursor: pointer;
        }
    }

    .wrapper:hover,
    .wrapper:focus {
        & .actions {
            opacity: 1;
        }
    }
</style>
