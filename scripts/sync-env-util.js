const fs = require('fs');

const isString = (value) => {
	return typeof value === 'string';
};

const escapeValueRegex = (input) => {
	return (input + '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const wrapEnvironmentValue = (value) => {
	if (isString(value)) return '\'' + value + '\'';
	return value;
};

const replaceEnvironmentValue = (input, key, value) => {
	const entryPattern = new RegExp('(' + escapeValueRegex(key) + ': ?)([^,\n\r]+)([,|\n|\r]{0,1})');
	const safeValue = wrapEnvironmentValue(value);
	return (input + '').replace(entryPattern, '$1' + safeValue + '$3');
};

const setEnvironmentValue = (key, value) => {
	const envFilePath = './src/environment.ts';
	const envFileData = fs.readFileSync(envFilePath).toString();
	const envFileUpdate = replaceEnvironmentValue(envFileData, key, value);
	fs.writeFileSync(envFilePath, envFileUpdate, 'utf8');
};

module.exports.setEnvironmentValue = setEnvironmentValue;