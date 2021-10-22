import * as yargs from 'yargs';

import { config } from './config';
import { generateAndCopyPackedProjectModule, releasePrepare, releasePublish } from './core';

const noop = () => {
};

const runCommand = (argv: any, action: () => void): void => {
	config.dryRun = !!argv.dryRun;
	config.cwd = argv.cwd || process.cwd();
	action();
};

export const buildCommandLine = () => yargs
	.wrap(null)
	.showHelpOnFail(true)
	.demandCommand()
	.option('dry-run', {
		description: 'perform a dry run for the selected command - no git or filesystem changes will be made when this is set',
		default: false,
		required: false
	})
	.option('cwd', {
		description: 'option to specify a working directory for the command context',
		required: false
	})
	.command(
		'release',
		'operations for staging and publishing releases',
		subYargs => subYargs
			.demandCommand()
			.command(
				'prepare',
				'similar to the npm version command, but allows for same-value versions and does not perform any git alterations',
				packYargs => packYargs
					.option('release-as', {
						description: 'value to be passed to npm version command',
						default: 'patch',
						required: false
					}),
				argv => runCommand(argv, () => releasePrepare(argv.releaseAs + ''))
			)
			.command(
				'publish',
				'publishes the currently set version as both a git tag and a release branch',
				noop,
				argv => runCommand(argv, () => releasePublish())
			)
			.command(
				'pack',
				'packs the target module using npm, and moves the result to the given output directory (--out)',
				packYargs => packYargs
					.option('out', {
						description: 'optional output directory, used based on command context',
						default: './packed',
						required: false
					}),
				argv => runCommand(argv, () => generateAndCopyPackedProjectModule(argv.out + ''))
			)
	);