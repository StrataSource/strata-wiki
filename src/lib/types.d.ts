interface ArticleMeta {
    title: string;
    description?: string;
    weight?: number;
    id?: string;
    deprecated?: boolean;
    experimental?: boolean;
    features?: string[];

    /** Used to store any additional data necessary to render the page. */
    extraData?: unknown;
}

type NoticeType =
    | "normal"
    | "note"
    | "warning"
    | "caution"
    | "bug"
    | "tip"
    | "game";

interface MenuArticle {
    id: string;
    meta: ArticleMeta;
}
interface MenuCategory {
    id: string;
    title: string;
    weight: number | null;
    articles: MenuArticle[];
}

interface GameMeta {
    name: string;
    features: string[];
}
interface GameMetaCollection {
    [id: string]: GameMeta;
}
