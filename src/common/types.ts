import { Slug } from './slug';

export type HTMLString = string;
export type MarkdownString = string;

// Imported from meta.json
export interface MetaTopic {
    id: string;
    path: string;
    name: string;
}

// Imported from meta.json
export interface MetaCategory {
    id: string;
    label: string;
    home: string;
    topics?: MetaTopic[];
    redirect?: string;
}

// Imported from meta.json
// Top level structure
export interface MetaGame {
    id: string;
    logo: string;
    icon: string;
    iconPNG?: string;
    favicon?: string;
    name: string;
    nameShort?: string;
    color: string;
    categories: MetaCategory[];
    features: string[];
}

export interface Article {
    id: string;
    content: HTMLString;
    title: string;
    slug: Slug;
    file: string;
    meta: PageMeta;
}

export interface PageMeta {
    title?: string;
    features?: string[];
}

export interface RenderedPage {
    content: HTMLString;
    meta: PageMeta;
    slug: Slug;
}

export interface Index {
    [gameID: string]: {
        id: string;
        meta: MetaGame;
        categories: {
            [categoryID: string]: {
                meta: MetaCategory;
                topics: {
                    [topicID: string]: {
                        meta: MetaTopic;
                        articles: {
                            [articleID: string]: Article;
                        };
                    };
                };
            };
        };
    };
}

export interface MenuArticle {
    id: string;
    name: string;
    link: string;
}

export interface MenuTopic {
    id: string;
    name: string;
    link: string;
    articles: MenuArticle[];
}

export interface Menu {
    [gameID: string]: {
        [categoryID: string]: MenuTopic[];
    };
}
