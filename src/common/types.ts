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

export interface PageMeta {
    title?: string;
    features?: string[];
    example?: string;
}

export interface RenderedPage {
    path: string;
    content: HTMLString;
    meta: PageMeta;
}

export interface Article {
    id: string;
    slug: Slug;
    page: RenderedPage;
}

export interface MenuArticle {
    name: string;
}

export interface MenuTopic {
    name: string;
    articles: { [articleID: string]: MenuArticle };
}

export interface MenuCategory {
    name: string;
    home?: string;
    redirect?: string;
    topics?: { [topicID: string]: MenuTopic };
}

export interface MenuGame {
    name: string;
    icon: string;
    color: string;
    categories: { [categoryID: string]: MenuCategory };
}

export interface Menu {
    games: { [gameID: string]: MenuGame };
}
