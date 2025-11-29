import subprocess
import sys
import os

def main():
    """Run the CloudForge backend server"""
    os.chdir('backend')
    subprocess.call([sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'])

if __name__ == "__main__":
    main()
