#!/usr/bin/env python3
"""
Simple HTTP server for the Vanishing TicTacToe web application.
Run this script to serve the web files locally.

Usage:
    python server.py

Then open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress favicon.ico 404 errors (browsers request it automatically)
        # Check self.path instead of args to avoid TypeError when called from log_error
        if hasattr(self, 'path') and 'favicon.ico' in self.path:
            return
        # Also suppress service-worker.js requests
        if hasattr(self, 'path') and 'service-worker.js' in self.path:
            return
        # Custom log format
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format%args))

if __name__ == "__main__":
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

