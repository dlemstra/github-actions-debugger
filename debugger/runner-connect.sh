#!/bin/sh

. ~/runner-info

echo "$RUNNER_IDENTITY" > ~/codespaces.auto

chmod 600 ~/codespaces.auto

cat <<EOF > ~/.ssh/config
Host runner
    Hostname localhost
    Port 4748
    User $RUNNER_USER
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    IdentityFile ~/codespaces.auto
EOF

chmod 600 /root/.ssh/config

cd $(find /workspaces -mindepth 1 -type d -not -name '.*' -print -quit)

if [ -d "runner" ]; then
  umount runner || true
  rmdir runner
fi

mkdir runner
sshfs runner:$RUNNER_PATH runner

echo "Connected and mounted $RUNNER_PATH from runner at $PWD/runner."

tail -f /dev/null || true
