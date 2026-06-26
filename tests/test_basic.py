import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.config import get_settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_isolated_store(isolated_event_store):
    """Ensure every test uses the isolated event store fixture."""
    pass

def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_readyz():
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

def test_session_endpoint():
    response = client.get("/session")
    assert response.status_code == 200
    data = response.json()
    assert "session_token" in data

def test_analyze_endpoint():
    # Test safe command analysis
    response = client.post("/analyze", json={"command": "ls -la"})
    assert response.status_code == 200
    data = response.json()
    assert data["classification"] == "safe"
    assert data["risk_score"] < 50.0

    # Test malicious command analysis
    response = client.post("/analyze", json={"command": "rm -rf / --no-preserve-root"})
    assert response.status_code == 200
    data = response.json()
    assert "classification" in data

def test_analyze_empty_command_fails_gracefully():
    # Under slowapi rate limits, client should get standard fastapi errors
    response = client.post("/analyze", json={"command": ""})
    assert response.status_code == 400
    assert "detail" in response.json()

def test_agent_events_endpoint():
    payload = {
        "command": "whoami",
        "pid": 9999,
        "ppid": 9998,
        "uid": 1000,
        "gid": 1000,
        "comm": "test-agent"
    }
    response = client.post("/agent/events", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "classification" in data

def test_get_events_and_stats():
    # Insert some dummy analysis
    client.post("/analyze", json={"command": "ls"})
    client.post("/analyze", json={"command": "rm -rf / --no-preserve-root"})

    # Get events
    response = client.get("/events?limit=10")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 2

    # Get stats
    response = client.get("/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_events"] >= 2

def test_clear_events():
    client.post("/analyze", json={"command": "ls"})
    response = client.delete("/events")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_webhooks_crud():
    # List webhooks
    response = client.get("/webhooks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Create webhook
    wh_payload = {
        "url": "http://example.com/webhook",
        "trigger_safe": False,
        "trigger_suspicious": True,
        "trigger_malicious": True
    }
    response = client.post("/webhooks", json=wh_payload)
    assert response.status_code == 200
    webhook = response.json()
    assert webhook["url"] == wh_payload["url"]
    assert "id" in webhook

    # List again
    response = client.get("/webhooks")
    assert response.status_code == 200
    assert len(response.json()) > 0

    # Delete webhook
    webhook_id = webhook["id"]
    response = client.delete(f"/webhooks/{webhook_id}")
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

def test_alerts_history():
    response = client.get("/alerts/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_remediation_settings():
    # Get remediation
    response = client.get("/settings/remediation")
    assert response.status_code == 200
    assert "enabled" in response.json()

    # Update remediation
    response = client.post("/settings/remediation", json={"enabled": True})
    assert response.status_code == 200
    assert response.json() == {"enabled": True}

def test_threshold_settings():
    # Get thresholds
    response = client.get("/settings/thresholds")
    assert response.status_code == 200
    data = response.json()
    assert "suspicious_threshold" in data
    assert "malicious_threshold" in data

    # Update thresholds
    update_payload = {
        "suspicious_threshold": 25.0,
        "malicious_threshold": 65.0
    }
    response = client.post("/settings/thresholds", json=update_payload)
    assert response.status_code == 200
    assert response.json() == update_payload

def test_websocket_connection():
    with client.websocket_connect("/ws") as websocket:
        # Should be able to receive initial list of events
        # And send a ping to get a pong
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert data == "pong"
