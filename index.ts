import * as process from 'process';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
    const token = core.getInput('token');
    const codespace = core.getInput('codespace');
    if (codespace === '' || token === '') {
        core.info('No codespace provided, skipping');
        return;
    }

    core.exportVariable('GH_TOKEN', token);
    core.info(`platform: ${process.platform}`);
    const exitCode = await exec.exec('gh', ['cs', 'ssh', `-c ${codespace}`, 'true'], { silent: false, ignoreReturnCode: true });
    core.info(`gh cs ssh -c ${codespace} true exited with code ${exitCode}`);
}

run();
