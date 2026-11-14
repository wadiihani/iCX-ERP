import pytest
from datetime import date


def get_auth_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiesec.org.ma", "password": "AdminSecret123"},
    )
    return res.json()["access_token"]


def test_sending_entity_directory(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "country": "Germany",
        "mc_name": "AIESEC in Germany",
        "lc_name": "LC Berlin",
        "region": "Europe",
        "expa_id": "DE-BER-001",
        "snd_cluster": "UPSCALE",
        "primary_contact_name": "Lukas Weber (VP IR)",
        "primary_contact_email": "lukas.weber@aiesec.de",
        "status": "ACTIVE",
    }

    create_res = client.post("/api/v1/irm/entities", json=payload, headers=headers)
    assert create_res.status_code == 201
    entity = create_res.json()
    assert entity["country"] == "Germany"
    assert entity["snd_cluster"] == "UPSCALE"
    entity_id = entity["id"]

    # Filter by cluster
    list_res = client.get("/api/v1/irm/entities?cluster=UPSCALE", headers=headers)
    assert list_res.status_code == 200
    entities = list_res.json()
    assert len(entities) >= 1
    assert any(e["id"] == entity_id for e in entities)


def test_visa_feasibility_assessment_with_disclaimer(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    today = date.today()
    payload = {
        "country": "Tunisia",
        "assessment_status": "FEASIBLE",
        "estimated_processing_days": 15,
        "visa_category": "Short Stay / No Visa Needed for < 90 days",
        "source_citation": "Moroccan Ministry of Foreign Affairs Bilateral Visa Exemption Agreement 2024",
        "effective_date": today.isoformat(),
        "notes": "Tunisian citizens enter Morocco visa-free for up to 90 days for unpaid volunteering.",
    }

    create_res = client.post("/api/v1/irm/visa-feasibility", json=payload, headers=headers)
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["country"] == "Tunisia"
    assert data["assessment_status"] == "FEASIBLE"
    # Mandatory disclaimer invariant
    assert "not constitute official legal advice" in data["advisory_disclaimer"].lower()
    assert "source_citation" in data


def test_irm_partnership_tracking(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create sending entity
    se_res = client.post(
        "/api/v1/irm/entities",
        json={
            "country": "France",
            "mc_name": "AIESEC in France",
            "lc_name": "LC Paris",
            "region": "Europe",
            "snd_cluster": "GROW",
        },
        headers=headers,
    )
    se_id = se_res.json()["id"]

    # Create partnership agreement
    part_res = client.post(
        "/api/v1/irm/partnerships",
        json={
            "sending_entity_id": se_id,
            "product_type": "iGTa",
            "target_pipeline_eps": 5,
            "delivered_eps": 2,
            "status": "ACTIVE",
            "weekly_sync_cadence": "Weekly on Wednesdays",
            "notes": "Co-promotion of IT talent opportunities in Rabat.",
        },
        headers=headers,
    )
    assert part_res.status_code == 201
    partnership = part_res.json()
    assert partnership["sending_entity_country"] == "France"
    assert partnership["target_pipeline_eps"] == 5
    assert partnership["delivered_eps"] == 2
