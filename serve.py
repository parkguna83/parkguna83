import http.server
import socketserver
import socket
import os
import webbrowser

PORT = 8000

def get_local_ip():
    try:
        # Create a dummy socket to connect to an external IP (doesn't actually connect)
        # to find out which interface is used for internet access.
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    # Change directory to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    ip = get_local_ip()
    url = f"http://{ip}:{PORT}/standalone.html"
    
    print("="*60)
    print(f"Mobile Connection: http://{ip}:{PORT}/standalone.html")
    print(f"\n   URL: {url}\n")
    print("="*60)
    print("PC에서도 브라우저가 자동으로 열립니다.")
    print("서버를 종료하려면 이 창을 닫거나 Ctrl+C를 누르세요.")
    
    # Open browser on PC automatically
    webbrowser.open(url)

    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server()
