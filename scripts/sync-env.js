#! /usr/bin/env node

const fs = require('fs');
const { setEnvironmentValue } = require('./sync-env-util');

const loadPackageVersion = () => {
	const { version } = JSON.parse(fs.readFileSync('./package.json').toString());
	return version;
};

setEnvironmentValue('version', loadPackageVersion());