const path = require('path');

module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended'
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2018,
		useJSXTextNode: true,
		project: [path.resolve(__dirname, 'tsconfig.json')]
	},
	rules: {
		'no-underscore-dangle': 0,
		'arrow-body-style': 0,
		'no-unused-expressions': 0,
		'no-plusplus': 0,
		'no-console': 0,
		'func-names': 0,
		'comma-dangle': 0,
		'no-prototype-builtins': 0,
		'prefer-destructuring': 0,
		'no-else-return': 0,
		'no-unused-vars': 0,
		'lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: true}],
		'@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
		'@typescript-eslint/explicit-member-accessibility': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-inferrable-types': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/no-empty-function': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-var-requires': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/no-empty-interface': 0,
		'@typescript-eslint/ban-types': 0,
		'@typescript-eslint/triple-slash-reference': 0,
		'react/display-name': 0,
		'react/no-children-prop': 0,
		'react/prop-types': 0,
		'react/no-find-dom-node': 0,
		'react/self-closing-comp': ['error', {
			"component": true,
			"html": true
		}],
		'no-useless-escape': 0,
		'no-control-regex': 0,
		'no-async-promise-executor': 0
	},
	settings: {
		react: {
			createClass: 'createClass',
			version: '17.0.1'
		}
	},
	env: {
		jasmine: true,
		jest: true
	}
};
