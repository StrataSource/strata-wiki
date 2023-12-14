import fs from 'node:fs';
import hljs from 'highlight.js';
import yaml from 'yaml';
import MarkdownIt from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import container_block from 'markdown-it-container';
import markdownItFrontMatter from 'markdown-it-front-matter';
import markdownItAnchor from 'markdown-it-anchor';
import twemoji from 'twemoji';

import { MarkdownString, RenderedPage } from '../common/types';
import { registerHightlights } from './highlights';

export class Renderer {
    private md: MarkdownIt;

    // This is a temporary value used to hold the output of FrontMatter. Doesn't look like we can get rid of it...
    private tempMetaValue;

    constructor() {
        registerHightlights(hljs);

        this.md = new MarkdownIt({
            linkify: true,
            typographer: true,
            highlight: (str, lang) => {
                if (lang && hljs.getLanguage(lang))
                    try {
                        return hljs.highlight(str, { language: lang }).value;
                    } catch {}

                return '';
            }
        })
            .use(markdownItEmoji)
            .use(markdownItAnchor)
            .use(markdownItFrontMatter, (frontMatter) => (this.tempMetaValue = yaml.parse(frontMatter)));

        // Use Twemojis for emojis
        this.md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
    }

    /**
     * Registers a given game up for its exclusive block handler
     * @param id The game's ID
     * @param nameShort The game's short name
     */
    registerGame(id: string, nameShort: string): void {
        this.md.use(container_block, id, {
            validate: (params) => params.trim() === id,
            render: (tokens, idx) =>
                tokens[idx].nesting === 1
                    ? // opening tag
                      `<div class='theme-${id} exclusive'><div class="exclusive-header">${nameShort} only!</div>\n`
                    : // closing tag
                      '</div>\n'
        });
    }

    /**
     * Renders any Markdown string into HTML
     * @param str A string of raw Markdown
     * @param slug The slug of the current page, used for passthrough
     * @returns An object that includes the rendered HTML.
     */
    render(str: MarkdownString): RenderedPage {
        this.tempMetaValue = {};
        return {
            path: '',
            content: this.md.render(str),
            meta: this.tempMetaValue
        };
    }

    /**
     * Renders Markdown into a page based on the slug
     * @param {string} path The path to the markdown file
     * @returns Rendered HTML of the page
     */
    renderPage(path: string): RenderedPage {
        console.log(`Rendering file ${path}`);
        const page = this.render(
            fs.readFileSync(path, {
                encoding: 'utf8'
            })
        );

        // Store paths relative to root directory
        if (path.startsWith('../')) path = path.slice(3);
        page.path = path;

        return page;
    }
}
