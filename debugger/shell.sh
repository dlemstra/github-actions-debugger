#!/bin/sh
set -e

. ~/runner-info

printf "\n\033[1;32mWork folder is:\033[0m \033[1;35m$RUNNER_PATH\033[0m\n\n"

ssh runner
