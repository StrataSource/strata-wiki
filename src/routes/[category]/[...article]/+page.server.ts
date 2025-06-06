import {
    isPathTopic,
    getCategories,
    getMenu,
    getMenuTopic,
    getContent, 
    getPageMeta,
    getTopicMeta,
} from "$lib/content.server";
import type { EntryGenerator, PageServerLoad } from "./$types";

function getAllArticles(category: string, out: { category: string; article: string }[], menu: MenuTopic, path: string)
{
    out.push(
        ...menu.articles.map((v) => ({ category: category || "", article: `${path}${v.id}` }))
    );

    for(const subtopic of menu.subtopics) {
        // Need to strip the category off the path
        const prefix = subtopic.id.substring(category.length + 1);
        getAllArticles(category, out, subtopic, `${prefix}/`);
    }
}

export const entries: EntryGenerator = () => {
    const categories = getCategories();

    const out: { category: string; article: string }[] = [];

    for (const category of categories) {
        if (!category.id) {
            continue;
        }
        getAllArticles(category.id, out, getMenu(category.id), "");
    }

    return out;
};

export const load = (async ({ params }) => {
    const path = `${params.category}/${params.article}`;
    if (isPathTopic(path)) {
        return {
            isTopic: true,
            ...getMenuTopic(path)
        }
    } else {
        return {
            isTopic: false,
            doc: getContent(path),
            articleMeta: getPageMeta(path),
            topicID: getTopicMeta(path).id,
        }
    }
}) satisfies PageServerLoad;
