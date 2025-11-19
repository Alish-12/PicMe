import logging
import json
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

from config import Config


class JsonFormatter(logging.Formatter):
    """Format logs as JSON for easier consumption and grading."""
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }

        # If custom extra fields (like event data) were added
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_record.update(record.extra_data)

        return json.dumps(log_record)


def setup_logging():
    """Configure logging for the entire app."""
    log_level = getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO)

    # Make sure root logger is reset
    root = logging.getLogger()
    root.setLevel(log_level)
    root.handlers.clear()

    formatter = JsonFormatter()

    if Config.LOG_TO_STDOUT:
        # Log to console (Docker-friendly)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        root.addHandler(handler)
    else:
        # Log to a rotating file for local debugging
        log_path = Path(Config.EVENTS_LOG_PATH)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        handler = RotatingFileHandler(
            log_path,
            maxBytes=1_000_000,
            backupCount=3,
            encoding="utf-8"
        )
        handler.setFormatter(formatter)
        root.addHandler(handler)
