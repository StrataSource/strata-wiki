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
