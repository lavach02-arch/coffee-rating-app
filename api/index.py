import sys
import os
import shutil

basedir = os.path.abspath(os.path.dirname(__file__))
backend_dir = os.path.abspath(os.path.join(basedir, '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# On Vercel Serverless, /tmp is writable while other directories are read-only
db_src = os.path.join(backend_dir, 'instance', 'coffee.db')
db_tmp = '/tmp/coffee.db'

# Copy pre-seeded SQLite DB to /tmp if not already present
if os.path.exists(db_src) and not os.path.exists(db_tmp):
    try:
        shutil.copyfile(db_src, db_tmp)
        os.environ['DATABASE_URL'] = f'sqlite:///{db_tmp}'
    except Exception as e:
        print(f"Notice copying db to /tmp: {e}")

from app import create_app
from config import Config

app = create_app(Config)
