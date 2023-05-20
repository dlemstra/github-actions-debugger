FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y sshfs openssh-server vim locales && \
    locale-gen en_US.UTF-8

COPY id_rsa /root/.ssh/id_rsa

COPY id_rsa.pub /root/.ssh/authorized_keys

RUN chmod 600 /root/.ssh/id_rsa
