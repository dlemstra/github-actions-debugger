FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y sshfs openssh-server vim locales psmisc && \
    locale-gen en_US.UTF-8

COPY mount-runner /usr/bin/mount-runner

RUN chmod 700 /usr/bin/mount-runner

COPY stop-runner /usr/bin/stop-runner

RUN chmod 700 /usr/bin/stop-runner

COPY runner-connect /usr/bin/runner-connect

RUN chmod 700 /usr/bin/runner-connect
