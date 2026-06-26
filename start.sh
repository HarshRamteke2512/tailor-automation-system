#!/bin/bash
set -e

cd /app/python
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

socat TCP-LISTEN:8089,reuseaddr,fork TCP:127.0.0.1:8090 &

exec java -jar /app/java/app.jar --server.port=8090
