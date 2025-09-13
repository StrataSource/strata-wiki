// Categories are the top level of organization. These are for large separate sections of documentation
// Categories hold topics
// Topics can hold articles or more topics
// Articles are the pages you read

type GeneratorType =
    | "markdown"
    | "material"
    | "entity"
    | "typedoc"
    | "vscript"
    | "angelscript"
    | "sound_operators"
    | "concommand"
    | "convar";

type NoticeType =
    | "normal"
    | "note"
    | "warning"
    | "caution"
    | "bug"
    | "tip"
    | "game";

interface BasePageMeta {
    type: GeneratorType;
    title: string;
    weight?: number;
}

// Articles are the pages you read
interface ArticleMeta extends BasePageMeta {
    description?: string;
    deprecated?: boolean;
    experimental?: boolean;
    features?: string[];
    /**
     * Disables page actions like editing or history.
     */
    disablePageActions?: boolean;
}

// Topics hold articles. These also get reused for categories
interface TopicMeta extends BasePageMeta {
    id: string;
    reverseOrder?: boolean;

    // Helper for if we've recursively discovered this instead of a real meta file for the directory
    wasDiscovered?: boolean;
}

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

interface PageGeneratorIndex {
    topics: MenuTopic[];
    articles: MenuArticle[];
}

interface PageGenerator {
    init: () => void;
    getPageContent: (path: string, article: string) => any;
    getPageMeta: (path: string, article: string) => ArticleMeta;
    getIndex: (path: string) => PageGeneratorIndex;
}
