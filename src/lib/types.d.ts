type GeneratorType =
    | "markdown"
    | "material"
    | "entity"
    | "typedoc"
    | "vscript"
    | "sound_operators"
    | "command";

interface ArticleMeta {
    type: GeneratorType;
    title: string;
    description?: string;
    weight?: number;
    id?: string;
    deprecated?: boolean;
    experimental?: boolean;
    features?: string[];
    /**
     * Disables page actions like editing or history.
     */
    disablePageActions?: boolean;
    reverseOrder?: boolean;

    // Helper for if we've recursively discovered this instead of a real meta file for the directory
    wasDiscovered?: boolean;
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
interface MenuTopic {
    id: string;
    title: string;
    weight: number | null;
    articles: MenuArticle[];
    subtopics: MenuTopic[];
}

interface GameMeta {
    name: string;
    features: string[];
    color: string;
}
interface GameMetaCollection {
    [id: string]: GameMeta;
}

interface PageGenerator {
    init: () => void;
    getPageContent: (path: string, article: string) => any;
    getPageMeta: (path: string, article: string) => ArticleMeta;
    getTopic: (path: string) => MenuArticle[];
    getSubtopics: (path: string) => MenuTopic[];
}
