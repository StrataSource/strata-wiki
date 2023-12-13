const path = require('path');

module.exports = {
	entry: {
		index: './src/client/index.ts',
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'public/resources/js'),

		clean: true,
		
		library: 'WikiClient',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
};
