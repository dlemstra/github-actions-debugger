#!/bin/sh
set -e

killall tail || true

cd $(find /workspaces -mindepth 1 -type d -not -name '.*' -print -quit)

umount runner || true

rmdir runner

rm ~/.ssh/authorized_keys
rm ~/codespaces.auto
rm ~/runner-info
