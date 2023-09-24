import { HLJSApi } from 'highlight.js';

export function registerHightlights(hljs: HLJSApi): void {
    hljs.registerLanguage('kv', (hljs) => ({
        name: 'KeyValues',
        aliases: ['kv', 'vdf'],

        contains: [
            {
                scope: 'keyword',
                begin: /(#(include|base))/,
                end: /\W/
            },
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_NUMBER_MODE,
            {
                scope: 'string',
                begin: /(\w)/,
                end: /[\n ]/,
                contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
                scope: 'string',
                begin: /"/,
                end: /"/,
                contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
                scope: 'meta',
                begin: /\[/,
                end: /]/,
                contains: [
                    {
                        scope: 'symbol',
                        begin: /\$/,
                        end: /(?=(\W))/
                    }
                ]
            }
        ]
    }));

    hljs.registerLanguage('squirrel', (hljs) => {
        let VERBATIM_STRING;
        let HASH_COMMENT;
        return {
            name: 'Squirrel',
            aliases: ['squirrel', 'sq'],

            keywords: {
                keyword:
                    'base break case catch class clone continue const default delete else enum extends for foreach function if in local resume return switch this throw try typeof while yield constructor instanceof static __LINE__ __FILE__ rawcall',
                literal: 'true false null'
            },

            contains: [
                hljs.QUOTE_STRING_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    match: /__LINE__|__FILE__/,
                    scope: 'variable.language'
                },
                (VERBATIM_STRING = {
                    scope: 'string',
                    begin: /@"/,
                    end: /"/,
                    contains: [hljs.BACKSLASH_ESCAPE]
                }),
                (HASH_COMMENT = {
                    scope: 'comment',
                    begin: /#/,
                    end: /$/
                }),
                {
                    match: [/\b(class)/, /\s+/, /[A-Z_a-z]\w*/],
                    scope: {
                        1: 'keyword',
                        3: 'title.class'
                    }
                },
                {
                    match: [/\b(extends)/, /\s+/, /[A-Z_a-z]\w*/],
                    scope: {
                        1: 'keyword',
                        3: 'title.class.inherited'
                    }
                },
                {
                    beginKeywords: 'function constructor',
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
                                HASH_COMMENT
                            ]
                        },
                        {
                            scope: 'title.function',
                            begin: /[A-Z_a-z]\w*/
                        }
                    ]
                }
            ]
        };
    });
}
