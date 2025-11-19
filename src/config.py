import os

class Config:
    # App host + port
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8080"))

    # Logging config
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_TO_STDOUT = os.getenv("LOG_TO_STDOUT", "1") == "1"

    # Path where capture events are stored (when not logging to stdout)
    EVENTS_LOG_PATH = os.getenv("EVENTS_LOG_PATH", "logs/events.log")
