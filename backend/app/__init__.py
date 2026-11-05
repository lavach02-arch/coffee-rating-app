import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from .database import db
from .routes import api_bp
from config import Config

def create_app(config_class=Config):
    """Application factory for Coffee Rating Application."""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Initialize CORS for REST API endpoints
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    db.init_app(app)

    # Register API blueprint
    app.register_blueprint(api_bp)

    # Path to built frontend (if available)
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        """Serves built frontend or API index information."""
        if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, 'index.html')):
            if path != "" and os.path.exists(os.path.join(frontend_dist, path)):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, 'index.html')
        return {
            'service': 'Coffee Rating Application REST API',
            'status': 'online',
            'api_documentation': '/api/health, /api/coffees, /api/leaderboard, /api/statistics',
            'frontend': 'Run Vite dev server or npm run build in frontend directory.'
        }

    # Initialize tables
    with app.app_context():
        db.create_all()

    return app
