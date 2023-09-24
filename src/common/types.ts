import { Slug } from './slug';

export type HTMLString = string;
export type MarkdownString = string;

export interface Topic {
    id: string;
    path: string;
    name: string;
}

export interface Category {
    id: string;
    label: string;
    home: string;
    topics?: Topic[];
    redirect?: string;
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

export interface Game {
    id: string;
    logo: string;
    icon: string;
    iconPNG?: string;
    name: string;
    nameShort?: string;
    color: string;
    categories: { [game: string]: Category };
    features: string[];
}

export type ObjectItemsToArray<T, K, V extends keyof T> = Omit<T, V> & { [V: string]: K[] };

export type GamesCategoryArray = ObjectItemsToArray<Game, Category, 'categories'>;

export interface Index {
    [gameID: string]: {
        id: string;
        meta: Game;
        categories: {
            [categoryID: string]: {
                meta: Category;
                topics: {
                    [topicID: string]: {
                        meta: Topic;
                        articles: {
                            [articleID: string]: Article;
                        };
                    };
                };
            };
        };
    };
}

export interface MenuCategoryItem {
    type: 'topic' | 'article';
    id: string;
    text: string;
    link: string;
}

export interface Menu {
    [gameID: string]: {
        [categoryID: string]: MenuCategoryItem[];
    };
}
