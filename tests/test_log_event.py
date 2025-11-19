from src.app import create_app


def test_log_event_success():
    app = create_app()
    client = app.test_client()

    payload = {
        "layout": "single",
        "filter": "bw",
        "frame": "gold",
        "timestamp": "2025-11-18T00:00:00Z",
    }

    resp = client.post("/api/log-event", json=payload)
    assert resp.status_code == 200

    data = resp.get_json()
    assert data["ok"] is True


def test_log_event_missing_field():
    app = create_app()
    client = app.test_client()

    payload = {
        "layout": "single",
        # filter missing on purpose
        "frame": "none",
        "timestamp": "2025-11-18T00:00:00Z",
    }

    resp = client.post("/api/log-event", json=payload)
    assert resp.status_code == 400
