import * as fs from 'fs';
import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

enum Platform {
    Windows = 'win32',
    Linux = 'linux',
    Macos = 'darwin',
}

async function executeCommand(command: string, args: string[]) {
    const options = {
        silent: false,
        ignoreReturnCode: true,
    };

    return await exec.exec(command, args, options);
}

async function copyFile(file: string) {
    core.info(`Copying '${file}' key to the codespace`);
    if (await executeCommand('scp', [file, 'codespace:']) !== 0) {
        core.info(`Failed to copy '${file}' key to the codespace`);
        return;
    }
}

async function run() {
    const token = core.getInput('token');
    const codespace = core.getInput('codespace');
    if (codespace === '' || token === '') {
        core.info('No codespace provided, skipping');
        return;
    }

    const env = process.env;
    env['GH_TOKEN'] = token;

    const platform = os.platform();

    core.info(`platform: ${platform}`);
    if (await executeCommand('gh', ['cs', 'ssh', '-c', codespace, 'true']) !== 0) {
        core.info('Failed to connect to codespace');
        return;
    }

    const sshFolder = path.join(os.homedir(), '.ssh');
    if (platform === Platform.Macos && await executeCommand('chmod', ['700', sshFolder]) !== 0) {
        core.info('Failed to set the correct permissions for ~/.ssh');
        return;
    }

    const configPath = path.join(sshFolder, 'config');
    const idFile = path.join(sshFolder, 'codespaces.auto');
    fs.writeFileSync(configPath, `Host codespace
  HostName cs.${codespace}.main
  User root
  ServerAliveInterval 60
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  ProxyCommand gh cs ssh -c ${codespace} --stdio -- -i ${idFile}
  IdentityFile ${idFile}`);

    await copyFile(configPath);

    if (await executeCommand('ssh', ['codespace', `echo ${process.cwd()} > runner-path`]) !== 0) {
        core.info('Failed to store runner path on the codespace');
        return;
    }
}

run();
