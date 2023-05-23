#!/bin/sh

chmod 600 ~/codespaces.auto

cat <<EOF > ~/.ssh/config
Host runner
    Hostname localhost
    Port 4748
    User $(cat ~/runner-user)
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

runner_path=$(sed 's/\r//g' ~/runner-path)
mkdir runner
sshfs runner:$runner_path runner

echo "Connected and mounted $runner_path from runner at $PWD/runner."

tail -f /dev/null || true

exit 0
