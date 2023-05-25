#!/bin/sh
set -e

mv /gitignore $CODESPACE_VSCODE_FOLDER/.gitignore
nohup sh -c '/usr/sbin/sshd -D &' > /dev/null
