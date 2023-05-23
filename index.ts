import * as fs from 'fs/promises';
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

async function startWindowsSshServer() {
    if (await executeCommand('powershell', ['-Command', 'Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0']) !== 0)
        return false;

    if (await executeCommand('powershell', ['-Command', 'Start-Service sshd']) !== 0)
        return false;

    return true;
}

async function addPublicKeyToAuthorizedKeys(platform: string, sshFolder: string, idFilePub: string) {
    let source = path.join(sshFolder, idFilePub);
    let destination = path.join(sshFolder, 'authorized_keys');
    await fs.copyFile(source, destination);

    if (platform !== Platform.Windows) {
        await fs.chmod(destination, 0o700);
        return
    }

    if (process.env.ALLUSERSPROFILE !== undefined) {
        source = destination;
        destination = path.join(process.env.ALLUSERSPROFILE, 'ssh', 'administrators_authorized_keys');
    }
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

async function copyFileToCodespace(file: string) {
    core.info(`Copying '${file}' key to the codespace`);
    if (await executeCommand('scp', [file, 'codespace:']) !== 0) {
        core.error(`Failed to copy '${file}' key to the codespace`);
        return false;
    }
    return true;
}

async function createAndCopyFileToCodespace(file: string, content: string) {
    await fs.writeFile(file, content);
    const result = await copyFileToCodespace(file);
    await fs.unlink(file);
    return result;
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
    await addPublicKeyToAuthorizedKeys(platform, sshFolder, 'codespaces.auto.pub');

    await executeCommand('ls', ['-all', sshFolder]);
    await executeCommand('cat', [path.join(sshFolder, 'authorized_keys')]);

    await fs.writeFile(configPath, `Host codespace
  HostName cs.${codespace}.main
  User root
  ServerAliveInterval 60
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  ProxyCommand gh cs ssh -c ${codespace} --stdio -- -i ${idFile}
  IdentityFile ${idFile}`);

    const runnerPath = process.cwd();
    if (await createAndCopyFileToCodespace('runner-path', runnerPath) !== true)
        return;

    const runnerUser = await whoami();
    if (await createAndCopyFileToCodespace('runner-user', runnerUser) !== true)
        return;

    await executeCommand('ssh', ['-R', '4748:localhost:22', 'codespace', 'runner-connect']);
}

run();
