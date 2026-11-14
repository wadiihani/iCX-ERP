import pytest
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_policy_rag_citation_grounding(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Query 1: Standards completion rules
    res = client.post("/api/v1/ai/chat", json={
        "agent_name": "POLICY_ASSISTANT",
        "prompt": "completion thresholds mandatory standards required"
    }, headers=admin_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "[VERIFIED]" in data["response_text"]
    assert "13 Mandatory Standards" in data["response_text"]
    assert "16" in data["response_text"]
    assert len(data["citations"]) > 0

    # Query 2: Prohibited hosts
    res2 = client.post("/api/v1/ai/chat", json={
        "agent_name": "POLICY_ASSISTANT",
        "prompt": "Can AIESEC entities act as hosting organizations?"
    }, headers=admin_headers)
    assert res2.status_code == 200
    data2 = res2.json()
    assert "[VERIFIED]" in data2["response_text"]
    assert "strictly prohibited" in data2["response_text"].lower()
