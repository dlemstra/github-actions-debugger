FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y sshfs openssh-server vim locales && \
    locale-gen en_US.UTF-8

COPY mount-runner /usr/bin/mount-runner

RUN chmod 700 /usr/bin/mount-runner

COPY runner-connect /usr/bin/runner-connect

RUN chmod 700 /usr/bin/runner-connect
