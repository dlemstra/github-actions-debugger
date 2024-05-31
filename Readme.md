# GitHub Actions Debugger

This action that can be used to debug a GitHub action on a hosted runner. This action needs to used be together with the [runner-codespace](https://github.com/dlemstra/runner-codespace) project. This project will start a codespace where this action connects to and allows a shell access to the runner that is running the action. And it also allows you to edit the files on the runner through a codespace.

## Inputs

### `token`

**Required** The personal access token that has access to codespaces.

```yaml
# GitHub token with the following permissions:
# - Full control of codespaces (codespace).

token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### `codespace`

**Optional** The name of the codespace that should be used.

If not specified the action will try to find the codespace that is using the `runner-codespace` project. The name of the codespace can be found in the URL of the codespace (`https://[NAME].github.dev/`).

```yaml
# The name of the codespace can be found in the URL of # the codespace
# (`https://[NAME].github.dev/`). If not specified the action will try
# to find the codespace that is using the runner-codespace project.

codespace: laughing-cod-jxvr564g44cpx9r
```

## Example

Below is an example of how this action can be used in a GitHub workflow.

```yaml
jobs:
  build:
    # also works on windows-latest and ubuntu-latest
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v4

    - run: something-that-fails.sh

    - name: Debug in Codespace
      if: failure()
      uses: dlemstra/github-actions-debugger@v1
      with:
        token: ${{ secrets.TOKEN_FOR_CODESPACES }}
```

Once the action has been triggered and the job has failed, the action will try to find the codespace that is using the `runner codespace` project. And when it has found the codespace it will connect to it and allow a shell to be opened on the runner that is running the action.

```shell
/workspaces/runner-codespace # shell
Warning: Permanently added '[localhost]:4748' (ED25519) to the list of known hosts.

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
Mac-1717160438331:runner-codespace runner$ uname -a
Darwin Mac-1717160438331.local 23.5.0 Darwin Kernel Version 23.5.0: Wed May  1 20:12:39 PDT 2024; root:xnu-10063.121.3~5/RELEASE_ARM64_VMAPPLE arm64
Mac-1717160438331:runner-codespace runner
```

## Demo

 A demo of this project can be found here: https://github.com/dlemstra/github-actions-debugger-demo.
