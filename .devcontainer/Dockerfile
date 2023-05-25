FROM alpine:3

RUN apk update && \
    apk add git openssh openrc sshfs vim

RUN rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key && \
    ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa && \
    ssh-keygen -f /etc/ssh/ssh_host_dsa_key -N '' -t dsa && \
    sed 's/AllowTcpForwarding no/AllowTcpForwarding yes/g' /etc/ssh/sshd_config > /etc/ssh/sshd_config

COPY debugger/stop-runner /usr/bin/stop-runner

RUN chmod 700 /usr/bin/stop-runner

COPY debugger/runner-connect /usr/bin/runner-connect

RUN chmod 700 /usr/bin/runner-connect

COPY debugger/shell /usr/bin/shell

RUN chmod 700 /usr/bin/shell

COPY debugger/gitignore /gitignore

COPY debugger/postStartCommand.sh /postStartCommand

ENV ENV=/root/.rc
