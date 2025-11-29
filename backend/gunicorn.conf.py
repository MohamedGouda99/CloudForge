import multiprocessing
import os

bind = "0.0.0.0:8000"

workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
threads = int(os.getenv("GUNICORN_THREADS", 2))

timeout = int(os.getenv("GUNICORN_TIMEOUT", 120))
keepalive = int(os.getenv("GUNICORN_KEEPALIVE", 5))
graceful_timeout = 30

max_requests = int(os.getenv("GUNICORN_MAX_REQUESTS", 1000))
max_requests_jitter = int(os.getenv("GUNICORN_MAX_REQUESTS_JITTER", 50))

preload_app = True

accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

capture_output = True
enable_stdio_inheritance = True

limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

forwarded_allow_ips = "*"
proxy_protocol = False
proxy_allow_ips = "*"


def on_starting(server):
    print(f"Starting Gunicorn server with {workers} workers")


def on_reload(server):
    print("Reloading Gunicorn server")


def worker_int(worker):
    print(f"Worker {worker.pid} received INT or QUIT signal")


def worker_abort(worker):
    print(f"Worker {worker.pid} received SIGABRT signal")


def pre_fork(server, worker):
    pass


def post_fork(server, worker):
    print(f"Worker {worker.pid} spawned")


def child_exit(server, worker):
    print(f"Worker {worker.pid} exited")


def worker_exit(server, worker):
    pass
