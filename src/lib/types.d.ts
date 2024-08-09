interface ArticleMeta {
    title: string;
    weight?: number;
    id?: string;
    deprecated?: boolean;
    experimental?: boolean;
    features?: [];
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
    articles: MenuArticle[];
}

interface GameMeta {
    name: string;
    features: string[];
}
interface GameMetaCollection {
    [id: string]: GameMeta;
}
