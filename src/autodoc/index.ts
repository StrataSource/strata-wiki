import { AutoDoc } from './core.js';
import { typedocGenerator } from './typedoc.js';

(async () => {
	const main = new AutoDoc('../pages/');
	await main.generate(typedocGenerator);
	main.compile();
})()
