import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from app import create_app
from config import Config

app = create_app(Config)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    print(f"☕ Coffee Rating API running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
