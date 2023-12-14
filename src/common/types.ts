export type HTMLString = string;
export type MarkdownString = string;

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
