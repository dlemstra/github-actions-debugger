@echo off

docker build -t ghaction -f Dockerfile ..
docker run -it ghaction /bin/bash