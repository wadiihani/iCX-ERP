import pytest
from datetime import datetime, timezone, timedelta, date
from decimal import Decimal


def get_auth_token(client, email="admin@aiesec.org.ma", password="AdminSecret123"):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


def test_master_operational_journeys_e2e(client, db):
    """
    Comprehensive End-to-End Master Acceptance Test Suite.
    Executes the 12 core operational journeys specified in the Master Specification.
    """
    admin_token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {admin_token}"}
    today = date.today()

    # -------------------------------------------------------------------------
    # JOURNEY 1: PRM Lead Generation & BANT Qualification (score >= 70)
    # -------------------------------------------------------------------------
    org_res = client.post(
        "/api/v1/organizations",
        json={
            "name": "Atlas Cloud Dynamics",
            "legal_name": "Atlas Cloud Solutions SARL",
            "sector": "Information Technology",
            "org_type": "Company",
            "location": "Rabat, Morocco",
            "tax_id": "MA-TAX-1029384",
        },
        headers=headers,
    )
    assert org_res.status_code == 201
    org_id = org_res.json()["id"]

    # Add Contact
    contact_res = client.post(
        f"/api/v1/organizations/{org_id}/contacts",
        json={
            "first_name": "Nabil",
            "last_name": "Berrada",
            "email": "nabil@atlascloud.example.com",
            "phone": "+212661998877",
            "job_title": "Head of People",
            "is_primary": True,
        },
        headers=headers,
    )
    assert contact_res.status_code == 201

    # Create Lead with high BANT score
    lead_res = client.post(
        "/api/v1/prm/leads",
        json={
            "organization_id": org_id,
            "title": "2026 iGTa Tech Talent Acquisition",
            "stage": "QUALIFIED",
            "source": "Corporate Referral",
            "territory": "Rabat",
            "bant": {
                "bant_budget": "HIGH",
                "bant_authority": "DECISION_MAKER",
                "bant_need": "CLEAR_NEED",
                "bant_timeline": "IMMEDIATE_1_3_MONTHS",
            },
            "target_products": ["iGTa"],
            "target_openings": 2,
        },
        headers=headers,
    )
    assert lead_res.status_code == 201
    lead_data = lead_res.json()
    assert lead_data["bant_score"] >= 70
    assert lead_data["is_qualified"] is True
    lead_id = lead_data["id"]

    # -------------------------------------------------------------------------
    # JOURNEY 2: Prohibited Host Rejection (AIESEC entity blocked)
    # -------------------------------------------------------------------------
    prohibited_res = client.post(
        "/api/v1/organizations",
        json={
            "name": "AIESEC in Rabat Association",
            "legal_name": "Association AIESEC Rabat",
            "sector": "Youth Leadership",
            "org_type": "AIESEC Entity",
            "location": "Rabat, Morocco",
        },
        headers=headers,
    )
    # Verification of prohibited host auto-detection
    assert prohibited_res.status_code == 201
    prohibited_data = prohibited_res.json()
    assert prohibited_data["is_prohibited"] is True
    assert "AIESEC" in (prohibited_data["prohibition_reason"] or "")

    # Attempting to create a B2B contract with a prohibited host is rejected
    prohibited_contract_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": "CTR-PROHIBITED-TEST",
            "organization_id": prohibited_data["id"],
            "title": "Prohibited Hosting Agreement",
            "product_types": ["iGV"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=90)).isoformat(),
            "total_slots": 2,
        },
        headers=headers,
    )
    assert prohibited_contract_res.status_code == 400
    assert "prohibited" in prohibited_contract_res.json()["detail"].lower()

    # -------------------------------------------------------------------------
    # JOURNEY 3: B2B Contract Repository & Capacity Allocation
    # -------------------------------------------------------------------------
    contract_res = client.post(
        "/api/v1/contracts",
        json={
            "contract_number": f"CTR-ATLAS-{org_id[:6]}",
            "organization_id": org_id,
            "lead_id": lead_id,
            "title": "Atlas Cloud iGTa Master Agreement 2026",
            "product_types": ["iGTa"],
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=365)).isoformat(),
            "total_slots": 2,
            "financial_terms": {"fee_per_slot": 3500, "currency": "MAD"},
        },
        headers=headers,
    )
    assert contract_res.status_code == 201
    contract_id = contract_res.json()["id"]

    # Sign the contract to transition to SIGNED
    sign_res = client.post(
        f"/api/v1/contracts/{contract_id}/sign",
        json={"signed_by_partner": "Nabil Berrada"},
        headers=headers,
    )
    assert sign_res.status_code == 200
    assert sign_res.json()["status"] == "SIGNED"

    # -------------------------------------------------------------------------
    # JOURNEY 4: Deterministic Product Creation (iGTa with salary & tier rules)
    # -------------------------------------------------------------------------
    opp_code = f"OPP-ATLAS-{org_id[:6]}"
    opp_res = client.post(
        "/api/v1/opportunities",
        json={
            "opportunity_code": opp_code,
            "contract_id": contract_id,
            "organization_id": org_id,
            "title": "Cloud DevOps Engineer Intern",
            "product_type": "iGTa",
            "modality": "PHYSICAL",
            "start_date": (today + timedelta(days=30)).isoformat(),
            "end_date": (today + timedelta(days=30 + 26 * 7)).isoformat(),
            "duration_weeks": 26,
            "working_hours_per_week": 35,
            "location": "Rabat, Morocco",
            "description": "Deploy infrastructure pipelines and manage Kubernetes clusters.",
            "role_description": "Work with AWS, Docker, Terraform, CI/CD pipelines.",
            "required_skills": ["AWS", "Docker", "Linux"],
            "required_languages": ["English"],
            "openings_capacity": 2,
            "igt_details": {
                "work_field": "IT",
                "sub_field": "DevOps",
                "duration_tier": "MEDIUM",
                "monthly_salary": 4800.00,
                "currency": "MAD",
                "salary_covers_living_costs": True,
                "accommodation_covered": False,
                "is_teaching_role": False,
                "accredited_institution": False,
            },
        },
        headers=headers,
    )
    assert opp_res.status_code == 201
    opp_data = opp_res.json()
    opp_id = opp_data["id"]
    assert opp_data["product_type"] == "iGTa"

    # Verify slots were auto-generated
    slots_res = client.get(f"/api/v1/opportunities/{opp_id}/slots", headers=headers)
    assert slots_res.status_code == 200
    slots = slots_res.json()
    assert len(slots) >= 1
    target_slot = slots[0]

    # -------------------------------------------------------------------------
    # JOURNEY 5: IRM Sending Entity Management & Visa Feasibility Citation
    # -------------------------------------------------------------------------
    se_res = client.post(
        "/api/v1/irm/entities",
        json={
            "country": "Germany",
            "mc_name": "Germany",
            "lc_name": f"AIESEC in Berlin {org_id[:4]}",
            "region": "Europe",
            "snd_cluster": "GROW",
            "primary_contact_name": "VP IR Berlin",
            "primary_contact_email": f"ir.berlin.{org_id[:4]}@aiesec.org",
        },
        headers=headers,
    )
    assert se_res.status_code in [201, 200]
    se_data = se_res.json()
    assert se_data["country"] == "Germany"

    # Visa Feasibility
    visa_res = client.post(
        "/api/v1/irm/visa-feasibility",
        json={
            "country": f"Germany_{org_id[:4]}",
            "assessment_status": "FEASIBLE",
            "estimated_processing_days": 1,
            "visa_category": "Tourist / Short Stay (Visa-Exempt)",
            "source_citation": "Moroccan Consular General Portal 2026 - Annex A (Visa-exempt under 90 days)",
            "effective_date": today.isoformat(),
        },
        headers=headers,
    )
    assert visa_res.status_code in [201, 200]
    assert "Moroccan Consular" in visa_res.json()["source_citation"]

    # -------------------------------------------------------------------------
    # JOURNEY 6: EP Candidate Directory, PII Masking & Deduplication
    # -------------------------------------------------------------------------
    ep_email = f"johann.schmidt.{org_id[:6]}@example.de"
    ep_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Johann",
            "last_name": "Schmidt",
            "email": ep_email,
            "phone": "+491761234567",
            "country_of_residence": "Germany",
            "nationality": "German",
            "passport_number": "DE988776655",
            "product_interests": "iGTa",
        },
        headers=headers,
    )
    assert ep_res.status_code == 201
    ep_data = ep_res.json()
    ep_id = ep_data["id"]

    # Deduplication test: duplicate email returns 409 Conflict
    dup_res = client.post(
        "/api/v1/crm/eps",
        json={
            "first_name": "Duplicate",
            "last_name": "Johann",
            "email": ep_email,
            "country_of_residence": "Germany",
            "nationality": "German",
        },
        headers=headers,
    )
    assert dup_res.status_code in [400, 409]
    assert "duplicate" in dup_res.json()["detail"].lower()

    # PII Masking check: Admin with ep:pii:view sees raw passport
    admin_get_ep = client.get(f"/api/v1/crm/eps/{ep_id}", headers=headers)
    assert admin_get_ep.json()["passport_number"] == "DE988776655"

    # -------------------------------------------------------------------------
    # JOURNEY 7: 9-Stage Screening Flow & SLA Clocks
    # -------------------------------------------------------------------------
    app_res = client.post(
        "/api/v1/applications",
        json={
            "ep_id": ep_id,
            "opportunity_id": opp_id,
        },
        headers=headers,
    )
    assert app_res.status_code == 201
    app_data = app_res.json()
    app_id = app_data["id"]
    assert app_data["current_stage"] == "APPLIED"
    assert app_data["official_expa_status"] == "APP"
    assert app_data["operational_readiness"] == "DRAFT"

    # Advance stage to CONTACTED
    stg_res = client.post(f"/api/v1/applications/{app_id}/transition", json={"target_stage": "CONTACTED"}, headers=headers)
    assert stg_res.status_code == 200
    assert stg_res.json()["current_stage"] == "CONTACTED"

    # Internal screening -> RECOMMENDED auto-advances to SHORTLISTED
    scr_res = client.post(
        f"/api/v1/applications/{app_id}/screening",
        json={
            "language_proficiency": "ADVANCED",
            "background_check_passed": True,
            "cultural_fit_rating": 5,
            "skills_match_rating": 5,
            "recommendation": "RECOMMENDED",
            "motivation_notes": "Very motivated DevOps candidate with strong Linux background.",
        },
        headers=headers,
    )
    assert scr_res.status_code == 200

    # Forward to OP -> stage becomes SENT_TO_OP
    fwd_res = client.post(f"/api/v1/applications/{app_id}/op-forward", headers=headers)
    assert fwd_res.status_code == 200
    assert fwd_res.json()["current_stage"] == "SENT_TO_OP"

    # Transition to INTERVIEW
    client.post(f"/api/v1/applications/{app_id}/transition", json={"target_stage": "INTERVIEW"}, headers=headers)

    # Schedule and conduct OP Interview with ACCEPTED -> auto-advances to OP_DECISION
    interview_res = client.post(
        f"/api/v1/applications/{app_id}/op-interview",
        json={
            "interviewer_name": "Nabil Berrada",
            "interview_type": "ONLINE",
            "scheduled_at": datetime.now(timezone.utc).isoformat(),
            "op_decision": "ACCEPTED",
            "feedback_notes": "Strong technical skills in Terraform and Docker. Highly recommended.",
        },
        headers=headers,
    )
    assert interview_res.status_code == 200

    # -------------------------------------------------------------------------
    # JOURNEY 8: Acceptance Note Verification & Dual-Status Slot Locking
    # -------------------------------------------------------------------------
    client.post(f"/api/v1/applications/{app_id}/transition", json={"target_stage": "ACCEPTED"}, headers=headers)

    # Upload Acceptance Note
    an_res = client.post(
        f"/api/v1/applications/{app_id}/acceptance-note",
        json={
            "document_url": "https://storage.aiesec.org.ma/an/AN-ATLAS-JOHANN.pdf",
            "ep_signature_date": today.isoformat(),
            "partner_signature_date": today.isoformat(),
            "is_verified": True,
            "verification_notes": "Verified signatures from both EP Johann Schmidt and partner Nabil Berrada.",
        },
        headers=headers,
    )
    assert an_res.status_code == 200

    # Approve Match with slot allocation
    match_res = client.post(
        f"/api/v1/applications/{app_id}/match-approve",
        json={"slot_id": target_slot["id"], "notes": "Full qualification and Acceptance Note verified."},
        headers=headers,
    )
    assert match_res.status_code == 200
    matched_app = match_res.json()
    assert matched_app["current_stage"] == "APPROVED"
    assert matched_app["official_expa_status"] == "APD"
    assert matched_app["operational_readiness"] == "READY"
    assert matched_app["slot_id"] == target_slot["id"]

    # -------------------------------------------------------------------------
    # JOURNEY 9: Exchange Operations, Flight Arrival & Accommodation Bed Assignment
    # -------------------------------------------------------------------------
    # Spawn exchange for approved application
    exc_spawn = client.post(f"/api/v1/exchanges/spawn-from-app/{app_id}", headers=headers)
    assert exc_spawn.status_code == 201
    exchange = exc_spawn.json()
    exchange_id = exchange["id"]
    assert exchange["delivery_status"] == "PRE_ARRIVAL"

    # Add Arrival Logistics
    logistics_res = client.post(
        "/api/v1/logistics/arrivals",
        json={
            "exchange_id": exchange_id,
            "flight_number": "RAM-805",
            "airline": "Royal Air Maroc",
            "arrival_airport": "CMN_CASABLANCA",
            "arrival_datetime": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "transport_mode": "TRAIN",
            "notes": "Arrived at CMN, escorting EP via Train to Rabat Ville.",
        },
        headers=headers,
    )
    assert logistics_res.status_code == 201
    logistics_id = logistics_res.json()["id"]

    # Update pickup status to PICKED_UP -> delivery status automatically transitions to ARRIVED
    pickup_res = client.put(
        f"/api/v1/logistics/arrivals/{logistics_id}/status",
        json={"pickup_status": "PICKED_UP"},
        headers=headers,
    )
    assert pickup_res.status_code == 200

    exc_refreshed = client.get(f"/api/v1/exchanges/{exchange_id}", headers=headers).json()
    assert exc_refreshed["delivery_status"] == "ARRIVED"

    # Create Accommodation Unit & assign bed
    acc_res = client.post(
        "/api/v1/logistics/accommodations",
        json={
            "unit_name": f"Hassan Tech Flat {org_id[:4]}",
            "address": "15 Avenue Moulay Youssef, Hassan",
            "neighborhood": "Hassan",
            "unit_type": "AIESEC_APARTMENT",
            "capacity_beds": 2,
            "monthly_rent_mad": 2800.00,
            "safety_inspection_passed": True,
        },
        headers=headers,
    )
    assert acc_res.status_code == 201
    unit_id = acc_res.json()["id"]

    bed_assign_res = client.post(
        "/api/v1/logistics/accommodations/assign",
        json={
            "exchange_id": exchange_id,
            "accommodation_unit_id": unit_id,
            "check_in_date": today.isoformat(),
            "check_out_date": (today + timedelta(days=180)).isoformat(),
            "bed_number": "Bed 1",
            "key_deposit_mad": 500.00,
        },
        headers=headers,
    )
    assert bed_assign_res.status_code == 201

    # -------------------------------------------------------------------------
    # JOURNEY 10: 18 Standards Fulfillment Engine & Deterministic Completion Calculator
    # -------------------------------------------------------------------------
    # Verify 13 mandatory standards + 3 optional standards (16 total)
    for std_num in range(1, 14):
        verify_std = client.put(
            f"/api/v1/cxp/exchanges/{exchange_id}/standards/{std_num}",
            json={
                "is_fulfilled": True,
                "evidence_doc_url": f"https://evidence.aiesec.org.ma/std/{std_num}_proof.pdf",
                "verification_notes": f"Standard {std_num} confirmed compliant with host.",
            },
            headers=headers,
        )
        assert verify_std.status_code == 200

    for opt_std in [14, 15, 16]:
        verify_opt = client.put(
            f"/api/v1/cxp/exchanges/{exchange_id}/standards/{opt_std}",
            json={
                "is_fulfilled": True,
                "evidence_doc_url": f"https://evidence.aiesec.org.ma/std/{opt_std}_proof.pdf",
                "verification_notes": f"Optional standard {opt_std} fulfilled.",
            },
            headers=headers,
        )
        assert verify_opt.status_code == 200

    # Calculate completion eligibility
    calc_res = client.get(f"/api/v1/cxp/exchanges/{exchange_id}/completion/evaluation", headers=headers)
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["mandatory_standards_fulfilled"] == 13
    assert calc_data["total_standards_fulfilled"] >= 16
    assert calc_data["is_eligible_for_completion"] is True

    # Human sign-off on completion
    comp_approve = client.post(
        f"/api/v1/cxp/exchanges/{exchange_id}/completion/approve",
        json={"notes": "All 13 mandatory standards and 3 optional standards fully verified by CXP."},
        headers=headers,
    )
    assert comp_approve.status_code == 200
    assert comp_approve.json()["completion_status"] == "APPROVED"

    # Verify triple status synchronization: delivery=COMPLETED, official EXPA=CO, operational=DONE
    final_exc = client.get(f"/api/v1/exchanges/{exchange_id}", headers=headers).json()
    assert final_exc["delivery_status"] == "COMPLETED"
    final_app = client.get(f"/api/v1/applications/{app_id}", headers=headers).json()
    assert final_app["official_expa_status"] == "CO"
    assert final_app["operational_readiness"] == "DONE"

    # -------------------------------------------------------------------------
    # JOURNEY 11: Pricing Engine, Payment Obligations, Milestone Tracking & Financial Audit
    # -------------------------------------------------------------------------
    rule_res = client.post(
        "/api/v1/finance/rulesets",
        json={
            "rule_name": f"Atlas iGTa Tier {org_id[:4]}",
            "product_type": "iGTa",
            "version": 1,
            "currency": "MAD",
            "base_fee": 3500.00,
            "min_duration_weeks": 6,
            "max_duration_weeks": 78,
            "weekly_additional_rate": 150.00,
            "administrative_fee": 500.00,
        },
        headers=headers,
    )
    assert rule_res.status_code == 201
    rule_id = rule_res.json()["id"]

    pricing_res = client.post(
        "/api/v1/finance/calculate",
        json={
            "rule_set_id": rule_id,
            "duration_weeks": 26,
            "modality": "PHYSICAL",
            "num_trainees": 1,
        },
        headers=headers,
    )
    assert pricing_res.status_code == 200
    price_data = pricing_res.json()
    assert Decimal(str(price_data["total_calculated_fee"])) > 0

    # Create Payment Obligation
    obl_res = client.post(
        "/api/v1/finance/obligations",
        json={
            "contract_id": contract_id,
            "opportunity_id": opp_id,
            "exchange_id": exchange_id,
            "obligation_title": "Atlas Cloud DevOps Slot Matching Fee",
            "milestone_trigger": "APPROVAL",
            "expected_amount": float(price_data["total_calculated_fee"]),
            "currency": "MAD",
            "due_date": today.isoformat(),
        },
        headers=headers,
    )
    assert obl_res.status_code == 201
    obl_id = obl_res.json()["id"]

    # Record Payment
    pay_res = client.post(
        "/api/v1/finance/payments",
        json={
            "obligation_id": obl_id,
            "amount_paid": float(price_data["total_calculated_fee"]),
            "currency": "MAD",
            "payment_method": "BANK_TRANSFER",
            "transaction_reference": f"VIR-ATLAS-{org_id[:6]}",
        },
        headers=headers,
    )
    assert pay_res.status_code == 201

    # Obligation is now verified as PAID
    obl_check = client.get(f"/api/v1/finance/obligations?contract_id={contract_id}", headers=headers).json()
    assert len(obl_check) >= 1
    assert obl_check[0]["status"] == "PAID"

    # -------------------------------------------------------------------------
    # JOURNEY 12: LangGraph Policy RAG Grounding, Agent Proposal Queuing, and Human Approval Execution
    # -------------------------------------------------------------------------
    # Ask Policy Assistant for compendium citations
    rag_res = client.post(
        "/api/v1/ai/chat",
        json={
            "agent_name": "POLICY_ASSISTANT",
            "prompt": "What are the rules for iGV product modality and duration?",
        },
        headers=headers,
    )
    assert rag_res.status_code == 200
    rag_data = rag_res.json()
    assert "[VERIFIED]" in rag_data["response_text"]
    assert len(rag_data["citations"]) > 0

    # Agent queues a proposal for human review using propose_action
    copilot_resp = client.post(
        "/api/v1/ai/chat",
        json={
            "agent_name": "EP_SCREENING_COPILOT",
            "prompt": "Evaluate candidate Johann and recommend promotion to approved.",
            "target_id": app_id,
            "propose_action": True,
        },
        headers=headers,
    )
    assert copilot_resp.status_code == 200
    copilot_data = copilot_resp.json()
    assert len(copilot_data["proposals_created"]) >= 1
    prop_id = copilot_data["proposals_created"][0]["proposal_id"]

    # Human Officer reviews and APPROVES proposal
    decide_res = client.put(
        f"/api/v1/approvals/{prop_id}/review",
        json={
            "decision": "APPROVED",
            "review_notes": "Proposal reviewed and approved by LCVP iCX.",
        },
        headers=headers,
    )
    assert decide_res.status_code == 200
    assert decide_res.json()["status"] == "APPROVED_EXECUTED"
    assert decide_res.json()["reviewed_by"] is not None

    print("\n🎉 ALL 12 MASTER OPERATIONAL JOURNEYS COMPLETED & VERIFIED SUCCESSFULLY!")
