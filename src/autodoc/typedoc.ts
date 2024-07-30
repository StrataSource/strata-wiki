import { JSONOutput, ReflectionKind } from 'typedoc';
import { readFile, mkdir } from 'fs/promises';
import { GeneratorFunc } from './core.js';

export const typedocGenerator: GeneratorFunc = async function(callback) {
	const document: JSONOutput.DocumentReflection = JSON.parse(await readFile('../js-types/docs.json', 'utf-8'));
	
	const dirTemplate = './%1/panorama/api/%2.md';
	function makePath(game: string, category: string) {
		return dirTemplate.replace('%1', game).replace('%2', category);
	}

	for (let game of document.children) {
		game.name = game.name.replace(/\/.*$/, '');
		console.log('Found game', game.name);

		if (game.kind === ReflectionKind.Module) {
			for (const api of game.children) {
				console.log('Found part', api.name, api.kind);

				// It gets its own file! Yippee!
				if (api.kind === ReflectionKind.Namespace) {
					callback({
						path: makePath(game.name, api.name),
						content: 'hi'
					});
				}

				// It also gets its own file!
				else if (api.kind === ReflectionKind.Interface) {
					callback({
						path: makePath(game.name, api.name),
						content: 'hi'
					});
				}

				// Put it in the main file!
				else {

				}
				
			}
		}
	}
	
}
