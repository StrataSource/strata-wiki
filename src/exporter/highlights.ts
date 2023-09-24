import { HLJSApi } from 'highlight.js';

export function registerHightlights(hljs: HLJSApi) {
    hljs.registerLanguage('kv', (hljs) => ({
        name: 'KeyValues',
        aliases: ['kv', 'vdf'],

        contains: [
            {
                className: 'keyword',
                begin: /(#(include|base))/,
                end: /\W/
            },
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_NUMBER_MODE,
            {
                className: 'string',
                begin: /(\w)/,
                end: /[\n ]/,
                contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
                className: 'string',
                begin: /"/,
                end: /"/,
                contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
                className: 'meta',
                begin: /\[/,
                end: /]/,
                contains: [
                    {
                        className: 'symbol',
                        begin: /\$/,
                        end: /(?=(\W))/
                    }
                ]
            }
        ]
    }));
}
