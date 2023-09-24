import fs from 'node:fs';
import hljs from 'highlight.js';
import yaml from 'yaml';
import container_block from 'markdown-it-container';
import MarkdownIt from 'markdown-it';
import markdownItFrontMatter from 'markdown-it-front-matter';
import { Slug } from '../common/slug';
import { MarkdownString, RenderedPage } from '../common/types';
import { Exporter } from './export';

export class Renderer {
    private md: MarkdownIt;
    private exporter: Exporter;

    private tempMetaValue;

    constructor(exporter) {
        this.exporter = exporter;

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
        }).use(markdownItFrontMatter, (frontMatter) => (this.tempMetaValue = yaml.parse(frontMatter)));

        // For each game, register up a handler for its game exclusive block
        for (const game of this.exporter.pageHandler.games) {
            console.log('Registered game', game.id);

            this.md.use(container_block, game.id, {
                validate: (params) => params.trim() === game.id,
                render: (tokens, idx) =>
                    tokens[idx].nesting === 1
                        ? // opening tag
                          `<div class='theme-${game.id} exclusive'><div class="exclusive-header">${
                              game.nameShort || game.name || game.id
                          } only!</div>\n`
                        : // closing tag
                          '</div>\n'
            });
        }
    }

    /**
     * Renders any Markdown string into HTML
     * @param str A string of raw Markdown
     * @param slug The slug of the current page, used for passthrough
     * @returns An object that includes the rendered HTML.
     */
    render(str: MarkdownString, slug: Slug): RenderedPage {
        this.tempMetaValue = {};
        return {
            content: this.md.render(str),
            meta: this.tempMetaValue,
            slug: slug
        };
    }

    /**
     * Renders Markdown into a page based on the slug
     * @param {string} path The path to the markdown file
     * @param {Slug} slug The slug to the page
     * @returns Rendered HTML of the page
     */
    renderPage(path: string, slug: Slug): RenderedPage {
        console.log('Rendering file', path, '->', slug.toString());

        return this.render(
            fs.readFileSync(path, {
                encoding: 'utf8'
            }),
            slug
        );
    }
}
