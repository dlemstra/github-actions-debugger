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

async function whoami() {
    let output = '';
    const options = {
        listeners: {
        stdout: (data: Buffer) => {
            output += data.toString();
        },
        },
    };
    await exec.exec('whoami', [], options);
    return output.trim();
}

async function startWindowsSshServer() {
    if (await executeCommand('powershell', ['-Command', 'Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0']) !== 0)
        return false;

    if (await executeCommand('powershell', ['-Command', 'Start-Service sshd']) !== 0)
        return false;

    return true;
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

    if (await executeCommand('gh', ['cs', 'ssh', '-c', codespace, 'true']) !== 0) {
        core.error('Failed to connect to codespace');
        return;
    }

    const platform = os.platform();
    const sshFolder = path.join(os.homedir(), '.ssh');
    if (platform === Platform.Macos && await executeCommand('chmod', ['700', sshFolder]) !== 0) {
        core.error('Failed to set the correct permissions for ~/.ssh');
        return;
    }

    if (platform === Platform.Windows && await startWindowsSshServer() !== true) {
        core.error('Failed to start the Windows SSH server');
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

    core.info(`Copying '${idFile}' key to the codespace`);
    if (await executeCommand('scp', [idFile, 'codespace:']) !== 0) {
        core.error(`Failed to copy '${idFile}' key to the codespace`);
        return;
    }

    const runnerPath = process.cwd();
    if (await executeCommand('ssh', ['codespace', `"echo ${runnerPath} > runner-path"`]) !== 0) {
        core.error('Failed to store runner path on the codespace');
        return;
    }

    const runnerUser = await whoami();
    if (await executeCommand('ssh', ['codespace', `"echo ${runnerUser} > runner-user"`]) !== 0) {
        core.error('Failed to store runner path on the codespace');
        return;
    }

    await executeCommand('ssh', ['-R', '4748:localhost:22', 'codespace', 'runner-connect']);
}

run();
