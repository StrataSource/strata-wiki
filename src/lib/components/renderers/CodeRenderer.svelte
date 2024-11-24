<script lang="ts">
    import type { Code } from "mdast";

    import hljs from "highlight.js";
    import "highlight.js/styles/felipec.min.css";
    import Icon from "../Icon.svelte";
    import { mdiCheck, mdiContentCopy } from "@mdi/js";
    import "@fontsource/source-code-pro";

    export let dat: Code;

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

    let copySuccess = 0;

    function copy() {
        navigator.clipboard.writeText(dat.value);

        copySuccess++;

        setTimeout(() => {
            copySuccess--;
        }, 1000);
    }
</script>

<div class="wrapper">
    <div class="actions">
        <button on:click={copy} title="Copy code">
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
    .wrapper {
        background-color: #333;
        border-radius: 0.25rem;
        margin: 0.25rem 0;
        width: 100%;

        position: relative;
    }

    .code {
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        font-family: "Source Code Pro", monospace;
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
