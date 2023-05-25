#!/bin/sh
set -e

nohup sh -c '/usr/sbin/sshd -D &' > /dev/null
