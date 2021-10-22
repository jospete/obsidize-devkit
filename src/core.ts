import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

import { config } from './config';

export function getAbsolutePath(...parts: string[]): string {
	return path.resolve(path.join(config.cwd, ...parts)).replace(/[\r\n|\n|\r]/gm, '');
}

export function loadProjectPackageVersion(): string {
	const projectPackagePath = getAbsolutePath('package.json');
	const { version } = JSON.parse(fs.readFileSync(projectPackagePath).toString());
	return version;
}

export function execCliCommand(cmd: string, cwd: string = config.cwd): void {
	console.log('[' + cwd + '] > ' + cmd);
	if (config.dryRun) return;
	execSync(cmd, { cwd, stdio: 'inherit' });
}

export function execCliCommandForResult(cmd: string, cwd: string = config.cwd): Buffer {
	console.log('[' + cwd + '] > ' + cmd);
	if (config.dryRun) return Buffer.from([0]);
	return execSync(cmd, { cwd, stdio: 'pipe' });
}

export function git(cmd: string): void {
	execCliCommand('git ' + cmd);
}

export function gitResult(cmd: string): Buffer {
	return execCliCommandForResult('git ' + cmd);
}

export function releasePrepare(version: string): void {
	execCliCommand('npm version --git-tag-version=false --allow-same-version=true ' + version);
}

export function generatePackedProjectModule(directory: string): string {
	return execCliCommandForResult('npm pack', directory).toString();
}

export function removeVersionSuffix(input: string, version: string): string {
	return (input + '').replace('-' + version, '');
}

export function releasePublish(): void {

	const version = loadProjectPackageVersion();
	const versionTag = 'v' + version;
	const releaseBranchName = 'release/' + versionTag;
	const gitStatusOutput = gitResult('status').toString();
	const currentBranchNameMatch = /On branch (\S+)/.exec(gitStatusOutput);

	if (!currentBranchNameMatch) {
		console.error('failed to match current branch from gitStatusOutput = ', gitStatusOutput);
		console.log('currentBranchNameMatch = ', currentBranchNameMatch);
		return;
	}

	const currentBranchName = currentBranchNameMatch[1];

	git('stash');
	git('checkout -b ' + releaseBranchName);
	git('stash apply');
	git('add --all');
	git('commit -m ' + versionTag);
	git('tag ' + versionTag);
	git('push -u origin --tags ' + releaseBranchName);
	git('checkout ' + currentBranchName);
	git('merge ' + releaseBranchName);
	git('push origin ' + currentBranchName);
}

export function generateAndCopyPackedProjectModule(
	inputDirectory: string,
	outputDirectory: string
): void {

	const version = loadProjectPackageVersion();
	const tarballFileName = generatePackedProjectModule(inputDirectory);
	const tarballWithoutVersion = removeVersionSuffix(tarballFileName, version);
	const tarballInputPath = getAbsolutePath(inputDirectory, tarballFileName);
	const tarballOutputPath = getAbsolutePath(outputDirectory, tarballWithoutVersion);
	const absOutputDirectory = path.dirname(tarballOutputPath);

	if (!fs.existsSync(absOutputDirectory)) {
		console.log('creating output directory: ' + absOutputDirectory);
		fs.mkdirSync(absOutputDirectory);
	}

	console.log('copying tarball ' + tarballInputPath + ' -> ' + tarballOutputPath);
	fs.copyFileSync(tarballInputPath, tarballOutputPath);

	console.log('removing generated tarball at ' + tarballInputPath);
	fs.rmSync(tarballInputPath);

	console.log('done!');
}