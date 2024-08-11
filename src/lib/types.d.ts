interface ArticleMeta {
    title: string;
    description?: string;
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
