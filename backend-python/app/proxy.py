import socket
import threading
import time

BACKEND = ("127.0.0.1", 8090)
RETRIES = 120
RETRY_DELAY = 1

def pipe(src, dst):
    try:
        while True:
            data = src.recv(4096)
            if not data:
                break
            dst.sendall(data)
    except:
        pass
    finally:
        try:
            src.close()
        except:
            pass
        try:
            dst.close()
        except:
            pass

def handle(client):
    backend = None
    for attempt in range(RETRIES):
        try:
            backend = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            backend.connect(BACKEND)
            break
        except ConnectionRefusedError:
            backend.close()
            backend = None
            time.sleep(RETRY_DELAY)
    if backend is None:
        try:
            client.sendall(b"HTTP/1.1 503 Service Unavailable\r\nContent-Length: 0\r\n\r\n")
        except:
            pass
        try:
            client.close()
        except:
            pass
        return
    t = threading.Thread(target=pipe, args=(client, backend), daemon=True)
    t.start()
    pipe(backend, client)

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("0.0.0.0", 8089))
server.listen(128)

while True:
    client, addr = server.accept()
    threading.Thread(target=handle, args=(client,), daemon=True).start()
