import * as fs from 'fs/promises';
import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

enum Platform {
    Windows = 'win32',
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
    core.info('Enabling the Windows SSH server');
    if (await executeCommand('powershell', ['-Command', 'Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0']) !== 0)
        return false;

    core.info('Starting the Windows SSH server');
    if (await executeCommand('powershell', ['-Command', 'Start-Service sshd']) !== 0)
        return false;

    return true;
}

async function addPublicKeyToAuthorizedKeys(platform: string, sshFolder: string, idFilePub: string) {
    const source = path.join(sshFolder, idFilePub);
    const authorized_keys = path.join(sshFolder, 'authorized_keys');
    await fs.copyFile(source, authorized_keys);

    if (platform === Platform.Windows) {
        const administrators_authorized_keys = path.join(process.env.ALLUSERSPROFILE || '', 'ssh', 'administrators_authorized_keys');
        fs.rename(authorized_keys, administrators_authorized_keys);
        await executeCommand('icacls', [administrators_authorized_keys]);
    }
}

async function whoami() {
    let output = '';
    const options = {
        listeners: {
            stdout: (data: Buffer) => {
                output += data.toString();
            }
        }
    };
    await exec.exec('whoami', [], options);
    return output.trim();
}

async function copyFileToCodespace(file: string) {
    core.info(`Copying '${file}' to the codespace`);
    if (await executeCommand('scp', [file, 'codespace:']) !== 0) {
        core.error(`Failed to copy '${file}' to the codespace`);
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

    core.info('Checking if the codespace is running');
    if (await executeCommand('gh', ['cs', 'ssh', '-c', codespace, 'true']) !== 0) {
        core.error('Failed to connect to codespace');
        return;
    }

    const platform = os.platform();
    const sshFolder = path.join(os.homedir(), '.ssh');
    if (platform === Platform.Macos && await executeCommand('chmod', ['700', sshFolder]) !== 0) {
        core.error(`Failed to set the correct permissions for ${sshFolder}`);
        return;
    }

    if (platform === Platform.Windows && await startWindowsSshServer() !== true) {
        core.error('Failed to start the Windows SSH server');
        return;
    }

    const configPath = path.join(sshFolder, 'config');
    const idFile = path.join(sshFolder, 'codespaces.auto');
    await addPublicKeyToAuthorizedKeys(platform, sshFolder, 'codespaces.auto.pub');

    await fs.writeFile(configPath, `Host codespace
  HostName cs.${codespace}.main
  User root
  ServerAliveInterval 60
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  ProxyCommand gh cs ssh -c ${codespace} --stdio -- -i ${idFile}
  IdentityFile ${idFile}`);

    if (await copyFileToCodespace(idFile) !== true)
        return;

    const runnerPath = process.cwd();
    if (await createAndCopyFileToCodespace('runner-path', runnerPath) !== true)
        return;

    const runnerUser = await whoami();
    if (await createAndCopyFileToCodespace('runner-user', runnerUser) !== true)
        return;

    core.info('Connecting to the codespace');
    await executeCommand('ssh', ['-R', '4748:localhost:22', 'codespace', 'runner-connect']);
}

run();
