#!/bin/bash
set -e

cd /app/python
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

python3 /app/python/app/proxy.py &

exec java -jar /app/java/app.jar --server.port=8090
