FROM alpine:3

RUN apk update && \
    apk add openssh-server openrc sshfs vim && \
    rc-update add sshd default

COPY mount-runner /usr/bin/mount-runner

RUN chmod 700 /usr/bin/mount-runner

COPY stop-runner /usr/bin/stop-runner

RUN chmod 700 /usr/bin/stop-runner

COPY runner-connect /usr/bin/runner-connect

RUN chmod 700 /usr/bin/runner-connect
