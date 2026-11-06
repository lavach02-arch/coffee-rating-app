import os
import shutil

basedir = os.path.abspath(os.path.dirname(__file__))

# If running on Vercel Serverless, use writable /tmp filesystem
default_db_path = os.path.join(basedir, 'instance', 'coffee.db')
if os.environ.get('VERCEL') or os.path.exists('/tmp'):
    tmp_db = '/tmp/coffee.db'
    if os.path.exists(default_db_path) and not os.path.exists(tmp_db):
        try:
            shutil.copyfile(default_db_path, tmp_db)
        except Exception:
            pass
    if os.path.exists(tmp_db):
        default_db_path = tmp_db

class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'coffee-rating-dev-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f"sqlite:///{default_db_path}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False

class TestConfig(Config):
    """Configuration for automated testing."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
