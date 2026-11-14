import pytest
from datetime import datetime, timezone, timedelta, date
from services.api.tests.test_exchange_ops import setup_approved_application, get_auth_token


def test_arrival_pickup_and_accommodation_management(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    app_id = setup_approved_application(client, headers)

    # Spawn Exchange
    spawn_res = client.post(f"/api/v1/exchanges/spawn-from-app/{app_id}", headers=headers)
    ex_id = spawn_res.json()["id"]

    # 1. Record flight arrival details
    arrival_time = datetime.now(timezone.utc) + timedelta(days=2)
    arr_res = client.post(
        "/api/v1/logistics/arrivals",
        json={
            "exchange_id": ex_id,
            "flight_number": "AT 202",
            "airline": "Royal Air Maroc",
            "arrival_airport": "CMN_CASABLANCA",
            "arrival_datetime": arrival_time.isoformat(),
            "transport_mode": "TRAIN",
            "notes": "EP taking Al Boraq high speed train from Casa to Rabat Agdal.",
        },
        headers=headers,
    )
    assert arr_res.status_code == 201
    logistics_id = arr_res.json()["id"]
    assert arr_res.json()["pickup_status"] == "PENDING"

    # 2. Update pickup status to PICKED_UP -> sets exchange delivery status to ARRIVED
    pickup_update = client.put(
        f"/api/v1/logistics/arrivals/{logistics_id}/status",
        json={
            "pickup_status": "PICKED_UP",
            "driver_name": "Yassine Mehdi",
            "driver_contact": "+212600112233",
            "notes": "Picked up from Rabat Agdal train station.",
        },
        headers=headers,
    )
    assert pickup_update.status_code == 200
    assert pickup_update.json()["pickup_status"] == "PICKED_UP"

    # Verify Exchange status changed to ARRIVED
    ex_after_pickup = client.get(f"/api/v1/exchanges/{ex_id}", headers=headers).json()
    assert ex_after_pickup["delivery_status"] == "ARRIVED"
    assert ex_after_pickup["actual_arrival_date"] is not None

    # 3. Register Accommodation Unit with 1 bed
    acc_res = client.post(
        "/api/v1/logistics/accommodations",
        json={
            "unit_name": "Agdal Residence A4",
            "address": "Avenue de France, Agdal, Rabat",
            "neighborhood": "Agdal",
            "unit_type": "AIESEC_APARTMENT",
            "capacity_beds": 1,
            "monthly_rent_mad": 2500,
            "landlord_name": "Hassan Amrani",
            "safety_inspection_passed": True,
        },
        headers=headers,
    )
    assert acc_res.status_code == 201
    unit_id = acc_res.json()["id"]
    assert acc_res.json()["capacity_beds"] == 1
    assert acc_res.json()["occupied_beds"] == 0

    # 4. Assign EP to accommodation
    today = date.today()
    assign_res = client.post(
        "/api/v1/logistics/accommodations/assign",
        json={
            "exchange_id": ex_id,
            "accommodation_unit_id": unit_id,
            "check_in_date": today.isoformat(),
            "check_out_date": (today + timedelta(weeks=8)).isoformat(),
            "bed_number": "Bed 1",
            "key_deposit_mad": 500,
        },
        headers=headers,
    )
    assert assign_res.status_code == 201

    # 5. Over-capacity assignment attempt -> 409 Conflict
    assign_over = client.post(
        "/api/v1/logistics/accommodations/assign",
        json={
            "exchange_id": ex_id,
            "accommodation_unit_id": unit_id,
            "check_in_date": today.isoformat(),
            "check_out_date": (today + timedelta(weeks=8)).isoformat(),
            "bed_number": "Bed 2",
        },
        headers=headers,
    )
    assert assign_over.status_code == 409
    assert "full capacity" in assign_over.json()["detail"].lower()
