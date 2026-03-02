# Gunicorn configuration for Zomathon
import eventlet
eventlet.monkey_patch()

import multiprocessing

# MUST use eventlet for Socket.IO
worker_class = 'eventlet'

# Number of workers (1 is recommended for Socket.IO on a single instance)
workers = 1

# Bind to the port provided by Render
bind = "0.0.0.0:10000"

# Timeouts to prevent SIGKILL
timeout = 120
keepalive = 5
