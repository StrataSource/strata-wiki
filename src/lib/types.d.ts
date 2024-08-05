interface ArticleMeta {
    title: string;
    weight?: number;
    id?: string;
}

type NoticeType =
    | "normal"
    | "note"
    | "warning"
    | "caution"
    | "bug"
    | "tip"
    | "game";

//TODO Remove this
interface MenuEntry {
    href: string;
    meta: ArticleMeta;
    dir: boolean;
}

interface MenuArticle {
    id: string;
    title: string;
}
interface MenuCategory {
    id: string;
    title: string;
    articles: MenuArticle[];
}
