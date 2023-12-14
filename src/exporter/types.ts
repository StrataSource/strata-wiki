import { Slug } from '../common/slug';
import { RenderedPage } from '../common/types';

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

export interface Article {
    id: string;
    slug: Slug;
    page: RenderedPage;
}
