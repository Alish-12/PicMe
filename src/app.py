from flask import Flask, jsonify, render_template, request
from datetime import datetime, timezone
import logging

from config import Config
from logging_config import setup_logging

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    @app.route("/api/log-event", methods=["POST"])
    def log_event():
        try:
            data = request.get_json(force=True)
        except Exception:
            return jsonify({"error": "Invalid JSON"}), 400

        required_fields = ["layout", "filter", "frame", "timestamp"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # Log event
        logger.info("capture_event", extra={
            "event": "capture",
            "layout": data["layout"],
            "filter": data["filter"],
            "frame": data["frame"],
            "timestamp_client": data["timestamp"],
        })

        return jsonify({"ok": True})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host=Config.APP_HOST, port=Config.APP_PORT)
