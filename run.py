import threading
import time
import sys
import os
import webview
import uvicorn
import socket

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from backend.main import app

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

def start_server():
    # Use a specific port
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

def wait_for_server(port, timeout=15):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    return False

class Api:
    def close_window(self):
        webview.windows[0].destroy()

def main():
    # Start backend in a separate thread
    t = threading.Thread(target=start_server, daemon=True)
    t.start()

    # Wait for server to be ready
    if not wait_for_server(8000):
        # If server fails, we still try to open the window to show something, 
        # or maybe the webview will show the connection error.
        pass
    
    # Determine URL
    # Check if we are running in frozen mode or if dist exists locally
    dist_path = get_resource_path("frontend/dist")
    
    # In frozen mode, dist_path should exist. 
    # In dev mode, we might want to use localhost:5173 if dist doesn't exist.
    if os.path.exists(dist_path):
        url = "http://127.0.0.1:8000"
    else:
        url = "http://localhost:5173"

    api = Api()
    webview.create_window("Wheat Detection AI", url, width=1440, height=900, frameless=True, js_api=api)
    webview.start()

if __name__ == "__main__":
    main()
