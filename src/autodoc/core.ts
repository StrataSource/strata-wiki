import { mkdir, writeFile } from 'fs/promises';
import Path, { dirname } from 'path';

export interface Article {
	path: string;
	content: string;
}

export interface GeneratorConfig {
	addTags?: string[];
	addDisclaimer?: boolean;
}

export type GeneratorFunc = (cb: (article: Article) => void) => Promise<void>;

export class AutoDoc {
	root: string;
	articles: Article[] = [];

	constructor(root: string) {
		this.root = root;
	}

	async generate(gen: GeneratorFunc, config?: GeneratorConfig) {
		await gen(article => {
			this.articles.push(article);
		});
	}

	async compile() {
		console.log('Finished!');
		for (const article of this.articles) {
			const path = Path.join(this.root, article.path);
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, article.content);
			console.log('Writing', path);
		}
	}
	
}
