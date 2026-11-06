import os
import sys

basedir = os.path.abspath(os.path.dirname(__file__))
if basedir not in sys.path:
    sys.path.insert(0, basedir)

from app import create_app
from config import Config

app = create_app(Config)

if __name__ == '__main__':
    app.run()
