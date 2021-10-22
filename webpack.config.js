const path = require('path');

module.exports = {
	entry: {
		cli: './src/cli.ts',
		index: './src/index.ts'
	},
	mode: 'production',
	target: 'node',
	externals: ['tslib', 'yargs', 'cpy-cli', 'rimraf'],
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
	output: {
		filename: '[name].cjs.js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			type: 'commonjs-module'
		}
	}
};