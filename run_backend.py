#!/usr/bin/env python
import subprocess
import sys
import os

os.chdir('backend')
sys.exit(subprocess.call(['uvicorn', 'app.main:app', '--host', 'localhost', '--port', '8000', '--reload']))
