import fs from 'fs';

/**
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡀⠀⣿⣿⠆
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠇⠀⣿⠁⠀
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣧⣴⣶⣿⡀⠀
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⡄
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⠇
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠿⠋⠀
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⠀⠀⠀
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
 * ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀
 * ⠀⠀⣀⣀⣤⣴⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀
 * ⠐⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠁⠀⠀⠀⠀⠀
 */
export class Slug {
    readonly game: string;
    readonly category?: string;
    readonly topic?: string;
    readonly article?: string;

    readonly path: string;

    constructor(slug: string) {
        if (slug.toLowerCase().startsWith('ajax') || slug.toLowerCase().startsWith('assets'))
            throw new Error(
                `Page names starting with "ajax" or "assets" are not permitted! Trying to render page ${slug}.`
            );

        const [game, category, topic, article] = slug.split('/');

        if (game) {
            this.game = game;
            if (category && category !== 'index') {
                this.category = category;
                if (topic && topic !== 'index') {
                    this.topic = topic;
                    this.article = article ?? 'index';
                } else this.topic = 'index';
            } else this.category = 'index';
        } else this.game = 'index';

        const possiblePaths = [
            `${this.game}/${this.topic}/${this.article}.md`,
            `shared/${this.topic}/${this.article}.md`,
            `${this.game}/index.md`,
            `shared/index.md`
        ];

        let found = false;
        for (const path of possiblePaths) {
            console.log('Checking file path', 'pages/' + path);
            if (fs.existsSync('pages/' + path)) {
                this.path = 'pages/' + path;
                console.log('Found file at path', path);
                found = true;
                break;
            }
        }
        if (!found) throw new Error('Could not locate Markdown file for slug: ' + this.toString());
    }

    toString() {
        let str = this.game;
        for (const property of [this.category, this.topic, this.article])
            if (property) str += '/' + property;
            else break;
        return str;
    }
}
