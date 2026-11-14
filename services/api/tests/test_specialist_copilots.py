import pytest
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_risk_auditor_and_partner_copilots(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Test Partner Intel Copilot
    res_partner = client.post("/api/v1/ai/chat", json={
        "agent_name": "PARTNER_INTEL_COPILOT",
        "prompt": "Summarize partnership opportunities with local banks in Rabat."
    }, headers=admin_headers)
    assert res_partner.status_code == 200, res_partner.text
    data_partner = res_partner.json()
    assert "[PARTNER INTEL]" in data_partner["response_text"]

    # 2. Test Agent Runs listing
    runs_res = client.get("/api/v1/ai/runs", headers=admin_headers)
    assert runs_res.status_code == 200
    runs = runs_res.json()
    assert len(runs) >= 1
