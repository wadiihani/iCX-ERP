import pytest
from fastapi.testclient import TestClient


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_command_center_analytics_and_funnel(client: TestClient):
    admin_token = get_auth_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Fetch Funnel Metrics
    funnel_resp = client.get("/api/v1/analytics/funnel", headers=admin_headers)
    assert funnel_resp.status_code == 200, funnel_resp.text
    funnel = funnel_resp.json()
    assert "stages" in funnel
    assert len(funnel["stages"]) == 6 # APP, ACC, APD, RE, FI, CO
    assert "total_applications" in funnel
    assert "small_sample_warning" in funnel

    # 2. Fetch SLA Compliance
    sla_resp = client.get("/api/v1/analytics/sla", headers=admin_headers)
    assert sla_resp.status_code == 200, sla_resp.text
    sla = sla_resp.json()
    assert "items" in sla
    assert "overall_compliance_percentage" in sla
    assert len(sla["items"]) >= 2 # 48h first contact, 72h OP review

    # 3. Fetch Financial Summary
    fin_resp = client.get("/api/v1/analytics/finance", headers=admin_headers)
    assert fin_resp.status_code == 200, fin_resp.text
    fin = fin_resp.json()
    assert "total_expected" in fin
    assert "total_collected" in fin
    assert "total_overdue" in fin
    assert fin["currency"] == "MAD"

    # 4. Fetch Full Command Center Overview
    overview_resp = client.get("/api/v1/analytics/overview", headers=admin_headers)
    assert overview_resp.status_code == 200, overview_resp.text
    overview = overview_resp.json()
    assert "funnel" in overview
    assert "sla" in overview
    assert "finance" in overview
    assert "active_exchanges_count" in overview
    assert "pending_approvals_count" in overview
    assert "active_leads_count" in overview
