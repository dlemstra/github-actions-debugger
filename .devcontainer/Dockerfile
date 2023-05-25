FROM alpine:3

RUN apk update && \
    apk add git openssh openrc sshfs vim

RUN rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key && \
    ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa && \
    ssh-keygen -f /etc/ssh/ssh_host_dsa_key -N '' -t dsa && \
    sed 's/AllowTcpForwarding no/AllowTcpForwarding yes/g' /etc/ssh/sshd_config > /etc/ssh/sshd_config

COPY debugger/runner-connect.sh /usr/bin/runner-connect

RUN chmod 700 /usr/bin/runner-connect

COPY debugger/shell.sh /usr/bin/shell

RUN chmod 700 /usr/bin/shell

COPY debugger/stop-runner.sh /usr/bin/stop-runner

RUN chmod 700 /usr/bin/stop-runner

COPY debugger/postStartCommand.sh /postStartCommand

RUN chmod 700 /postStartCommand

COPY debugger/.rc /root/.rc

COPY debugger/gitignore /gitignore

ENV ENV=/root/.rc
