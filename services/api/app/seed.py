"""Realistic synthetic data seeder for AIESEC iCX Command Center.
Populates complete, coherent operational data across all 18 modules for local demonstration and testing.
"""

import sys
import uuid
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash

# Identity models
from app.modules.identity.models import User, Role, Permission, UserRoleAssignment, Team
# Organizations & PRM
from app.modules.organizations.models import Organization, OrganizationContact
from app.modules.prm.models import PRMLead, PRMActivity
from app.modules.contracts.models import Contract, OperationalRisk
# Opportunities & IRM
from app.modules.opportunities.models import (
    Opportunity,
    OpportunityIGVDetails,
    OpportunityIGTDetails,
    OpportunitySlot,
)
from app.modules.irm.models import SendingEntity, VisaFeasibilityAssessment, IRMPartnership
# CRM & Applications
from app.modules.crm.models import ExchangeParticipant, EPDocument
from app.modules.applications.models import (
    Application,
    ApplicationScreening,
    OPInterview,
    AcceptanceNote,
)
# Exchanges, Logistics & CXP
from app.modules.exchanges.models import Exchange, ExchangeChecklist
from app.modules.logistics.models import ArrivalLogistics, AccommodationUnit, ExchangeAccommodation
from app.modules.cxp.models import ExchangeStandardsFulfillment, ExchangeCompletion
# Finance & Legalities
from app.modules.finance.models import PricingRuleSet, PaymentObligation, Payment, FinancialCase
from app.modules.legalities.models import RiskRegisterEntry, IACAuditItem, LegalDocument
# AI & Approvals
from app.modules.ai.models import AIAgentRun, AIAgentToolCall, KnowledgeDocument, KnowledgeChunk
from app.modules.approvals.models import ApprovalProposal
# Workflows & EXPA
from app.modules.workflows.models import TemporalWorkflowExecution, TemporalActivityLog, OperationalEscalation
from app.modules.expa.models import EXPASyncRun, EXPAStagedRecord, EXPAReconciliationRecord, EXPAGatedMutation


def seed_database(db=None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    print("🚀 Starting AIESEC iCX Command Center Synthetic Data Seeder...")

    try:
        # 1. ROLES & PERMISSIONS
        print("-> Seeding Roles & Permissions...")
        roles_data = [
            ("LCP_ADMIN", "LCP / Executive Admin"),
            ("LCVP_ICX", "LCVP iCX"),
            ("LCVP_FNL", "LCVP Finance & Legalities"),
            ("TEAM_LEADER", "Team Leader iCX"),
            ("BD_MEMBER", "Business Development Member"),
            ("IR_MEMBER", "International Relations Member"),
            ("EP_MANAGER", "EP Candidate Manager"),
            ("CX_MEMBER", "Operations & Customer Experience Member"),
        ]
        for role_id, role_name in roles_data:
            if not db.query(Role).filter(Role.id == role_id).first():
                db.add(Role(id=role_id, name=role_name))

        perms_data = [
            ("partner:read", "View Partners", "PRM"),
            ("partner:write", "Manage Partners", "PRM"),
            ("contract:read", "View Contracts", "PRM"),
            ("contract:draft", "Draft Contract", "PRM"),
            ("contract:approve", "Approve Contract", "PRM"),
            ("opportunity:read", "View Opportunities", "OPPORTUNITIES"),
            ("opportunity:create", "Create Opportunity", "OPPORTUNITIES"),
            ("opportunity:publish", "Publish Opportunity", "OPPORTUNITIES"),
            ("ep:read", "View EPs", "CRM"),
            ("ep:pii:view", "View Sensitive EP Data", "CRM"),
            ("application:screen", "Screen Applications", "APPLICATIONS"),
            ("application:match", "Approve Match", "APPLICATIONS"),
            ("exchange:read", "View Exchange Operations", "EXCHANGE"),
            ("exchange:logistics:edit", "Update Logistics", "EXCHANGE"),
            ("standards:verify", "Verify Standards Evidence", "CXP"),
            ("finance:pricing:read", "View Pricing", "FINANCE"),
            ("finance:payment:approve", "Approve Payments", "FINANCE"),
            ("approval:decide", "Decide Pending Approvals", "GOVERNANCE"),
            ("ai:invoke", "Use AI Copilots", "AI"),
            ("audit:read", "Inspect Audit Logs", "SECURITY"),
            ("admin:users", "Manage Users & Roles", "ADMIN"),
        ]
        for perm_id, perm_name, module in perms_data:
            if not db.query(Permission).filter(Permission.id == perm_id).first():
                db.add(Permission(id=perm_id, name=perm_name, module=module))
        db.flush()

        all_perms = db.query(Permission).all()
        admin_role = db.query(Role).filter(Role.id == "LCP_ADMIN").first()
        admin_role.permissions = all_perms

        lcvp_role = db.query(Role).filter(Role.id == "LCVP_ICX").first()
        lcvp_role.permissions = [p for p in all_perms if p.id != "admin:users"]

        # 2. USERS
        print("-> Seeding Users across roles...")
        users_info = [
            ("admin@aiesec.org.ma", "AdminPass123!", "Amine Benjelloun", "LCP_ADMIN"),
            ("admin@aiesec.net", "AdminPass123!", "Amine Benjelloun", "LCP_ADMIN"),
            ("lcp.admin@aiesec.net", "AdminPass123!", "Amine Benjelloun (LCP)", "LCP_ADMIN"),
            ("lcvp.icx@aiesec.org.ma", "AdminPass123!", "Khadija Mansouri", "LCVP_ICX"),
            ("lcvp.icx@aiesec.net", "AdminPass123!", "Khadija Mansouri (LCVP iCX)", "LCVP_ICX"),
            ("lcvp.fnl@aiesec.org.ma", "AdminPass123!", "Mehdi Alami", "LCVP_FNL"),
            ("vp.finance@aiesec.net", "AdminPass123!", "Mehdi Alami (VP Finance)", "LCVP_FNL"),
            ("tl.igv@aiesec.org.ma", "AdminPass123!", "Zineb Tazi", "TEAM_LEADER"),
            ("tl.igv@aiesec.net", "AdminPass123!", "Zineb Tazi (TL iGV)", "TEAM_LEADER"),
            ("bd.member@aiesec.org.ma", "AdminPass123!", "Yassine Berrada", "BD_MEMBER"),
            ("cx.member@aiesec.org.ma", "AdminPass123!", "Salma Chraibi", "CX_MEMBER"),
        ]
        users_map = {}
        for email, pwd, name, role_id in users_info:
            usr = db.query(User).filter(User.email == email).first()
            if not usr:
                usr = User(
                    email=email,
                    password_hash=get_password_hash(pwd),
                    full_name=name,
                    is_active=True,
                )
                db.add(usr)
                db.flush()
                db.add(UserRoleAssignment(user_id=usr.id, role_id=role_id))
            users_map[role_id] = usr
        db.flush()

        # 3. ORGANIZATIONS
        print("-> Seeding Organizations (Partners and Prohibited Hosts)...")
        org_casatech = db.query(Organization).filter(Organization.name == "Casatech Digital Solutions").first()
        if not org_casatech:
            org_casatech = Organization(
                name="Casatech Digital Solutions",
                legal_name="Casatech SARL",
                sector="Technology",
                org_type="Company",
                website="https://casatech.example.com",
                location="Casablanca / Rabat, Morocco",
                address="Technopolis Rabat-Salé, Batiment B2",
                tax_id="MA-TAX-9821721",
                verification_status="VERIFIED",
                is_prohibited=False,
                status="ACTIVE",
                relationship_health="EXCELLENT",
                account_manager_id=users_map["BD_MEMBER"].id,
            )
            db.add(org_casatech)
            db.flush()
            db.add(OrganizationContact(
                organization_id=org_casatech.id,
                first_name="Karim",
                last_name="Idrissi",
                email="karim@casatech.example.com",
                phone="+212661234567",
                job_title="VP Engineering",
                is_primary=True,
            ))

        org_alc = db.query(Organization).filter(Organization.name == "American Language Academy Rabat").first()
        if not org_alc:
            org_alc = Organization(
                name="American Language Academy Rabat",
                legal_name="ALA Education Centre SARL",
                sector="Education",
                org_type="Institution",
                website="https://ala-rabat.example.edu",
                location="Rabat, Morocco",
                address="4 Rue Agdal, Rabat",
                tax_id="MA-TAX-4433221",
                verification_status="VERIFIED",
                is_prohibited=False,
                status="ACTIVE",
                relationship_health="GOOD",
                account_manager_id=users_map["BD_MEMBER"].id,
            )
            db.add(org_alc)
            db.flush()
            db.add(OrganizationContact(
                organization_id=org_alc.id,
                first_name="Fatima",
                last_name="El Fassi",
                email="fatima@ala-rabat.example.edu",
                phone="+212662987654",
                job_title="Academic Dean",
                is_primary=True,
            ))

        org_redcrescent = db.query(Organization).filter(Organization.name == "Moroccan Red Crescent Rabat").first()
        if not org_redcrescent:
            org_redcrescent = Organization(
                name="Moroccan Red Crescent Rabat",
                legal_name="Croissant Rouge Marocain Rabat",
                sector="Non-Profit / Humanitarian",
                org_type="NGO",
                website="https://croissantrouge.example.org",
                location="Rabat, Morocco",
                address="Avenue Mohammed V, Rabat",
                verification_status="VERIFIED",
                is_prohibited=False,
                status="ACTIVE",
                relationship_health="EXCELLENT",
                account_manager_id=users_map["BD_MEMBER"].id,
            )
            db.add(org_redcrescent)
            db.flush()
            db.add(OrganizationContact(
                organization_id=org_redcrescent.id,
                first_name="Omar",
                last_name="Kabbaj",
                email="omar@croissantrouge.example.org",
                phone="+212663112233",
                job_title="Projects Coordinator",
                is_primary=True,
            ))

        org_prohibited = db.query(Organization).filter(Organization.name == "AIESEC in Rabat Host Branch").first()
        if not org_prohibited:
            org_prohibited = Organization(
                name="AIESEC in Rabat Host Branch",
                legal_name="AIESEC Morocco Association",
                sector="Youth Leadership",
                org_type="AIESEC Entity",
                location="Rabat, Morocco",
                verification_status="FLAGGED_PROHIBITED",
                is_prohibited=True,
                prohibition_reason="AIESEC entities are prohibited from being local hosting organizations for incoming exchanges.",
                status="PROHIBITED",
                relationship_health="BLOCKED",
            )
            db.add(org_prohibited)
        db.flush()

        # 4. PRM LEADS & BANT
        print("-> Seeding PRM Leads with BANT Scores...")
        lead_casatech = db.query(PRMLead).filter(PRMLead.organization_id == org_casatech.id).first()
        if not lead_casatech:
            lead_casatech = PRMLead(
                organization_id=org_casatech.id,
                title="Casatech 2026 iGTa Tech Talent Acquisition",
                stage="CONTRACT_SIGNED",
                source="Alumni Network",
                territory="Rabat-Casablanca",
                owner_id=users_map["BD_MEMBER"].id,
                bant_budget="HIGH",
                bant_authority="DECISION_MAKER",
                bant_need="CLEAR_NEED",
                bant_timeline="IMMEDIATE_1_3_MONTHS",
                bant_score=95,
                is_qualified=True,
                estimated_value=Decimal("15000.00"),
                target_products=["iGTa"],
                target_openings=3,
            )
            db.add(lead_casatech)
            db.flush()
            db.add(PRMActivity(
                organization_id=org_casatech.id,
                lead_id=lead_casatech.id,
                user_id=users_map["BD_MEMBER"].id,
                activity_type="MEETING",
                summary="Executive Alignment & B2B Term Sheet Signing",
                details="Agreed on 3 iGTa Full-Stack developer positions at 4,500 MAD monthly stipend each.",
                is_completed=True,
            ))
        db.flush()

        # 5. B2B CONTRACTS
        print("-> Seeding B2B Contracts...")
        today = date.today()
        ctr_casatech = db.query(Contract).filter(Contract.contract_number == "CTR-2026-CASATECH-01").first()
        if not ctr_casatech:
            ctr_casatech = Contract(
                contract_number="CTR-2026-CASATECH-01",
                organization_id=org_casatech.id,
                lead_id=lead_casatech.id if lead_casatech else None,
                title="B2B Global Talent Internship Agreement 2026",
                status="ACTIVE",
                version=1,
                product_types=["iGTa"],
                start_date=today,
                end_date=today + timedelta(days=365),
                total_slots=3,
                financial_terms={"base_fee_per_slot": 3500, "currency": "MAD"},
                document_url="https://docs.aiesec.org.ma/contracts/CTR-2026-CASATECH-01.pdf",
                signed_at=datetime.now(timezone.utc),
                signed_by_partner="Karim Idrissi",
                signed_by_aiesec_user_id=users_map["LCVP_ICX"].id,
                iac_audit_ready=True,
            )
            db.add(ctr_casatech)

        ctr_redcrescent = db.query(Contract).filter(Contract.contract_number == "CTR-2026-REDCRESCENT-01").first()
        if not ctr_redcrescent:
            ctr_redcrescent = Contract(
                contract_number="CTR-2026-REDCRESCENT-01",
                organization_id=org_redcrescent.id,
                title="iGV Community Health & First Aid Project Agreement 2026",
                status="ACTIVE",
                version=1,
                product_types=["iGV"],
                start_date=today,
                end_date=today + timedelta(days=180),
                total_slots=8,
                financial_terms={"base_fee_per_slot": 0, "currency": "MAD"},
                document_url="https://docs.aiesec.org.ma/contracts/CTR-2026-REDCRESCENT-01.pdf",
                signed_at=datetime.now(timezone.utc),
                signed_by_partner="Omar Kabbaj",
                signed_by_aiesec_user_id=users_map["LCVP_ICX"].id,
                iac_audit_ready=True,
            )
            db.add(ctr_redcrescent)

        ctr_alc = db.query(Contract).filter(Contract.contract_number == "CTR-2026-ALC-01").first()
        if not ctr_alc:
            ctr_alc = Contract(
                contract_number="CTR-2026-ALC-01",
                organization_id=org_alc.id,
                title="Global Teacher Teaching Fellow Agreement 2026",
                status="ACTIVE",
                version=1,
                product_types=["iGTe"],
                start_date=today,
                end_date=today + timedelta(days=365),
                total_slots=2,
                financial_terms={"base_fee_per_slot": 3000, "currency": "MAD"},
                document_url="https://docs.aiesec.org.ma/contracts/CTR-2026-ALC-01.pdf",
                signed_at=datetime.now(timezone.utc),
                signed_by_partner="Fatima El Fassi",
                signed_by_aiesec_user_id=users_map["LCVP_ICX"].id,
                iac_audit_ready=True,
            )
            db.add(ctr_alc)
        db.flush()

        # 6. OPPORTUNITIES & SLOTS
        print("-> Seeding Opportunities & Capacity Slots...")
        opp_igta = db.query(Opportunity).filter(Opportunity.opportunity_code == "OPP-2026-IGTA-001").first()
        if not opp_igta:
            opp_igta = Opportunity(
                opportunity_code="OPP-2026-IGTA-001",
                contract_id=ctr_casatech.id,
                organization_id=org_casatech.id,
                title="Full-Stack Python Engineer Intern",
                product_type="iGTa",
                modality="PHYSICAL",
                status="PUBLISHED",
                start_date=today + timedelta(days=30),
                end_date=today + timedelta(days=30 + 26 * 7),
                duration_weeks=26,
                working_hours_per_week=35,
                location="Rabat, Morocco",
                description="Join Casatech's agile engineering team building cloud-native SaaS microservices.",
                role_description="Develop REST APIs in Python/FastAPI, collaborate in sprints, write automated tests.",
                required_skills=["Python", "FastAPI", "SQLAlchemy", "Git"],
                required_languages=["English", "French"],
                openings_capacity=3,
                filled_openings=1,
                line_manager_name="Karim Idrissi",
                line_manager_contact="karim@casatech.example.com",
                is_published=True,
            )
            db.add(opp_igta)
            db.flush()
            db.add(OpportunityIGTDetails(
                opportunity_id=opp_igta.id,
                work_field="IT",
                sub_field="Software Development",
                duration_tier="MEDIUM",
                monthly_salary=Decimal("4500.00"),
                currency="MAD",
                salary_covers_living_costs=True,
                accommodation_covered=False,
                is_teaching_role=False,
                accredited_institution=False,
                icb_audit_status="APPROVED",
            ))
            for i in range(1, 4):
                db.add(OpportunitySlot(
                    opportunity_id=opp_igta.id,
                    slot_number=f"OPP-2026-IGTA-001-SLOT-{i}",
                    start_date=opp_igta.start_date,
                    end_date=opp_igta.end_date,
                    status="RESERVED" if i == 1 else "OPEN",
                    lock_version=1,
                ))

        opp_igv = db.query(Opportunity).filter(Opportunity.opportunity_code == "OPP-2026-IGV-001").first()
        if not opp_igv:
            opp_igv = Opportunity(
                opportunity_code="OPP-2026-IGV-001",
                contract_id=ctr_redcrescent.id,
                organization_id=org_redcrescent.id,
                title="EcoRabat: SDG 13 Climate Resilient Communities",
                product_type="iGV",
                modality="PHYSICAL",
                status="PUBLISHED",
                start_date=today + timedelta(days=45),
                end_date=today + timedelta(days=45 + 6 * 7),
                duration_weeks=6,
                working_hours_per_week=25,
                location="Rabat, Morocco",
                description="Grassroots environmental awareness, tree-planting, and public school workshops.",
                role_description="Facilitate workshops on waste reduction, lead community park restoration.",
                required_skills=["Communication", "Public Speaking", "Community Organizing"],
                required_languages=["English"],
                openings_capacity=8,
                filled_openings=2,
                line_manager_name="Omar Kabbaj",
                line_manager_contact="omar@croissantrouge.example.org",
                is_published=True,
            )
            db.add(opp_igv)
            db.flush()
            db.add(OpportunityIGVDetails(
                opportunity_id=opp_igv.id,
                sdg_number=13,
                sdg_target="Climate Action & Community Resilience",
                global_project_name="EcoRabat 2026",
                housing_provided=True,
                food_provided=False,
                transport_provided=True,
                project_fee_amount=Decimal("0.00"),
            ))
            for i in range(1, 9):
                db.add(OpportunitySlot(
                    opportunity_id=opp_igv.id,
                    slot_number=f"OPP-2026-IGV-001-SLOT-{i}",
                    start_date=opp_igv.start_date,
                    end_date=opp_igv.end_date,
                    status="RESERVED" if i <= 2 else "OPEN",
                    lock_version=1,
                ))
        db.flush()

        # 7. IRM SENDING ENTITIES & VISA FEASIBILITY
        print("-> Seeding IRM Sending Entities & Visa Feasibilities...")
        sending_entities_data = [
            ("Germany", "Germany", "AIESEC in Munich", "Europe", "UPSCALE", "FEASIBLE", 0, "Visa-free entry for German citizens up to 90 days tourism/volunteer."),
            ("Tunisia", "Tunisia", "AIESEC in Carthage", "MEA", "GROW", "FEASIBLE", 0, "Bilateral Morocco-Tunisia treaty: visa-exempt entry up to 90 days."),
            ("Turkey", "Turkey", "AIESEC in Istanbul", "Europe", "GROW", "FEASIBLE", 0, "Visa-exempt entry up to 90 days for Turkish passport holders."),
            ("Brazil", "Brazil", "AIESEC in Sao Paulo", "Americas", "INVEST", "FEASIBLE", 0, "Visa-exempt entry up to 90 days for Brazilian passport holders."),
        ]
        for country, mc, lc, reg, clus, v_stat, v_days, v_cite in sending_entities_data:
            se = db.query(SendingEntity).filter(SendingEntity.country == country, SendingEntity.lc_name == lc).first()
            if not se:
                se = SendingEntity(
                    country=country,
                    mc_name=mc,
                    lc_name=lc,
                    region=reg,
                    snd_cluster=clus,
                    primary_contact_name=f"{lc} VP IR",
                    primary_contact_email=f"ir@{lc.lower().replace(' ', '')}.aiesec.org",
                    status="ACTIVE",
                )
                db.add(se)
            v_feas = db.query(VisaFeasibilityAssessment).filter(VisaFeasibilityAssessment.country == country).first()
            if not v_feas:
                v_feas = VisaFeasibilityAssessment(
                    country=country,
                    assessment_status=v_stat,
                    estimated_processing_days=v_days,
                    source_citation=v_cite,
                    effective_date=today - timedelta(days=60),
                )
                db.add(v_feas)
        db.flush()

        # 8. EXCHANGE PARTICIPANTS (CRM)
        print("-> Seeding Exchange Participants...")
        eps_data = [
            ("Lucas", "Muller", "lucas.muller@example.de", "+491512345678", "Germany", "German", "P-DE-7788990"),
            ("Yasmine", "Benali", "yasmine.benali@example.tn", "+21620123456", "Tunisia", "Tunisian", "P-TN-1122334"),
            ("Ahmet", "Yilmaz", "ahmet.yilmaz@example.tr", "+905321112233", "Turkey", "Turkish", "P-TR-4455667"),
            ("Camila", "Santos", "camila.santos@example.br", "+5511988887777", "Brazil", "Brazilian", "P-BR-9900112"),
        ]
        eps_map = {}
        for fn, ln, em, ph, cor, nat, pass_num in eps_data:
            ep = db.query(ExchangeParticipant).filter(ExchangeParticipant.email == em).first()
            if not ep:
                ep = ExchangeParticipant(
                    first_name=fn,
                    last_name=ln,
                    email=em,
                    phone=ph,
                    country_of_residence=cor,
                    nationality=nat,
                    passport_number=pass_num,
                    status="ACTIVE",
                    product_interests="iGTa,iGV",
                )
                db.add(ep)
                db.flush()
                db.add(EPDocument(
                    ep_id=ep.id,
                    doc_type="CV",
                    file_name=f"CV_{fn}_{ln}.pdf",
                    mime_type="application/pdf",
                    storage_path=f"storage/cvs/CV_{fn}_{ln}.pdf",
                    is_verified=True,
                ))
            eps_map[fn] = ep
        db.flush()

        # 9. APPLICATIONS & MATCHING
        print("-> Seeding Applications...")
        app_lucas = db.query(Application).filter(Application.ep_id == eps_map["Lucas"].id).first()
        slot_1 = db.query(OpportunitySlot).filter(OpportunitySlot.slot_number == "OPP-2026-IGTA-001-SLOT-1").first()
        if not app_lucas:
            app_lucas = Application(
                application_code="APP-2026-IGTA-001",
                ep_id=eps_map["Lucas"].id,
                opportunity_id=opp_igta.id,
                slot_id=slot_1.id if slot_1 else None,
                current_stage="APPROVED",
                official_expa_status="APD",
                operational_readiness="READY",
                assigned_manager_id=users_map["EP_MANAGER"].id if "EP_MANAGER" in users_map else users_map["LCVP_ICX"].id,
                first_contacted_at=datetime.now(timezone.utc) - timedelta(days=20),
                accepted_at=datetime.now(timezone.utc) - timedelta(days=15),
                approved_at=datetime.now(timezone.utc) - timedelta(days=10),
            )
            db.add(app_lucas)
            db.flush()
            if slot_1:
                slot_1.status = "FILLED"
                slot_1.current_application_id = app_lucas.id
            db.add(ApplicationScreening(
                application_id=app_lucas.id,
                reviewer_id=users_map["LCVP_ICX"].id,
                language_proficiency="FLUENT",
                cultural_fit_rating=5,
                skills_match_rating=5,
                recommendation="RECOMMENDED",
            ))
            db.add(OPInterview(
                application_id=app_lucas.id,
                interviewer_name="Karim Idrissi",
                interview_type="ONLINE",
                scheduled_at=datetime.now(timezone.utc) - timedelta(days=18),
                conducted_at=datetime.now(timezone.utc) - timedelta(days=18),
                op_decision="ACCEPTED",
                feedback_notes="Excellent Python experience, solid communicator.",
            ))
            db.add(AcceptanceNote(
                application_id=app_lucas.id,
                document_url="https://docs.aiesec.org.ma/an/AN-APP-2026-IGTA-001.pdf",
                ep_signature_date=today - timedelta(days=14),
                partner_signature_date=today - timedelta(days=14),
                is_verified=True,
                verified_by=users_map["LCVP_ICX"].id,
            ))

        app_yasmine = db.query(Application).filter(Application.ep_id == eps_map["Yasmine"].id).first()
        slot_igv_1 = db.query(OpportunitySlot).filter(OpportunitySlot.slot_number == "OPP-2026-IGV-001-SLOT-1").first()
        if not app_yasmine:
            app_yasmine = Application(
                application_code="APP-2026-IGV-001",
                ep_id=eps_map["Yasmine"].id,
                opportunity_id=opp_igv.id,
                slot_id=slot_igv_1.id if slot_igv_1 else None,
                current_stage="ACCEPTED",
                official_expa_status="ACC",
                operational_readiness="DRAFT",
                first_contacted_at=datetime.now(timezone.utc) - timedelta(days=5),
                accepted_at=datetime.now(timezone.utc) - timedelta(days=2),
            )
            db.add(app_yasmine)
        db.flush()

        # 10. ACCOMMODATION UNITS & LOGISTICS
        print("-> Seeding Accommodations & Arrival Logistics...")
        acc_unit = db.query(AccommodationUnit).filter(AccommodationUnit.unit_name == "Agdal Residence AIESEC Flat").first()
        if not acc_unit:
            acc_unit = AccommodationUnit(
                unit_name="Agdal Residence AIESEC Flat",
                address="12 Rue Michlifen, Agdal",
                neighborhood="Agdal",
                unit_type="AIESEC_APARTMENT",
                capacity_beds=4,
                occupied_beds=1,
                monthly_rent_mad=Decimal("3500.00"),
                landlord_name="Haj Hassan",
                landlord_phone="+212661889900",
                safety_inspection_passed=True,
                last_inspected_at=datetime.now(timezone.utc) - timedelta(days=10),
            )
            db.add(acc_unit)
        db.flush()

        # 11. EXCHANGES & 18 STANDARDS
        print("-> Seeding Exchanges & Standards fulfillment...")
        exc_lucas = db.query(Exchange).filter(Exchange.application_id == app_lucas.id).first()
        if not exc_lucas:
            exc_lucas = Exchange(
                application_id=app_lucas.id,
                exchange_code="EXC-2026-IGTA-001",
                modality="PHYSICAL",
                delivery_status="ARRIVED",
                start_date=today - timedelta(days=3),
                end_date=today + timedelta(days=170),
                actual_arrival_date=today - timedelta(days=3),
                ips_completed=True,
                worksite_verified=True,
                first_day_attended=True,
                lead_manager_id=users_map["CX_MEMBER"].id,
            )
            db.add(exc_lucas)
            db.flush()

            # Logistics
            db.add(ArrivalLogistics(
                exchange_id=exc_lucas.id,
                flight_number="AT801",
                airline="Royal Air Maroc",
                arrival_airport="CMN_CASABLANCA",
                arrival_datetime=datetime.now(timezone.utc) - timedelta(days=3),
                pickup_status="PICKED_UP",
                transport_mode="TRAIN",
                notes="Airport pickup at CMN, escort via Al Boraq high speed train to Rabat Agdal.",
            ))

            # Accommodation assignment
            db.add(ExchangeAccommodation(
                exchange_id=exc_lucas.id,
                accommodation_unit_id=acc_unit.id,
                check_in_date=today - timedelta(days=3),
                check_out_date=today + timedelta(days=170),
                status="CHECKED_IN",
                bed_number="Bed 1",
                key_deposit_mad=Decimal("500.00"),
            ))

            # 18 Standards
            standards_names = [
                (1, "Personal Goal Setting", True, True),
                (2, "Outgoing Preparation", True, True),
                (3, "Expectation Setting", True, True),
                (4, "Visa and Work Permit", True, True),
                (5, "Arrival Pickup", True, True),
                (6, "Departure Support", True, False),
                (7, "Job Description", True, True),
                (8, "Working Hours", True, True),
                (9, "First Day of Work", True, True),
                (10, "Individual Leadership Development", True, True),
                (11, "Opportunity Closing", True, False),
                (12, "Accommodation", True, True),
                (13, "Basic Living Costs", True, True),
                (14, "Insurance", False, True),
                (15, "Incoming Preparation Seminar (IPS)", False, True),
                (16, "Leadership Development Spaces", False, True),
                (17, "Global Learning Environment", False, True),
                (18, "Debrief with AIESEC", False, False),
            ]
            for s_num, s_name, is_m, is_f in standards_names:
                db.add(ExchangeStandardsFulfillment(
                    exchange_id=exc_lucas.id,
                    standard_number=s_num,
                    standard_name=s_name,
                    is_mandatory=is_m,
                    is_fulfilled=is_f,
                    fulfillment_date=today - timedelta(days=2) if is_f else None,
                    verified_by=users_map["CX_MEMBER"].id if is_f else None,
                    evidence_doc_url=f"https://evidence.aiesec.org.ma/std/{exc_lucas.exchange_code}_{s_num}.pdf" if is_f else None,
                ))
            db.add(ExchangeCompletion(
                exchange_id=exc_lucas.id,
                total_standards_fulfilled=15,
                mandatory_standards_fulfilled=11,
                is_eligible_for_completion=False,
                completion_status="PENDING",
            ))
        db.flush()

        # 12. FINANCE & LEGALITIES
        print("-> Seeding Pricing, Payment Obligations, and Risk Register...")
        pricing_igta = db.query(PricingRuleSet).filter(PricingRuleSet.product_type == "iGTa").first()
        if not pricing_igta:
            pricing_igta = PricingRuleSet(
                rule_name="Standard Corporate iGTa Tier 2026",
                product_type="iGTa",
                version=1,
                currency="MAD",
                base_fee=Decimal("3500.00"),
                min_duration_weeks=6,
                max_duration_weeks=78,
                weekly_additional_rate=Decimal("150.00"),
                administrative_fee=Decimal("500.00"),
            )
            db.add(pricing_igta)

        pricing_igv = db.query(PricingRuleSet).filter(PricingRuleSet.product_type == "iGV").first()
        if not pricing_igv:
            pricing_igv = PricingRuleSet(
                rule_name="Global Volunteer Partner Tier 2026",
                product_type="iGV",
                version=1,
                currency="MAD",
                base_fee=Decimal("0.00"),
                min_duration_weeks=6,
                max_duration_weeks=12,
            )
            db.add(pricing_igv)

        pricing_igte = db.query(PricingRuleSet).filter(PricingRuleSet.product_type == "iGTe").first()
        if not pricing_igte:
            pricing_igte = PricingRuleSet(
                rule_name="Global Teacher Standard Tier 2026",
                product_type="iGTe",
                version=1,
                currency="MAD",
                base_fee=Decimal("3000.00"),
                min_duration_weeks=9,
                max_duration_weeks=78,
                weekly_additional_rate=Decimal("100.00"),
                administrative_fee=Decimal("500.00"),
            )
            db.add(pricing_igte)
        db.flush()

        obl_casatech = db.query(PaymentObligation).filter(PaymentObligation.contract_id == ctr_casatech.id).first()
        if not obl_casatech:
            obl_casatech = PaymentObligation(
                contract_id=ctr_casatech.id,
                opportunity_id=opp_igta.id,
                obligation_title="Casatech Initial Matching Fee (Slot 1)",
                milestone_trigger="APPROVAL",
                expected_amount=Decimal("3500.00"),
                paid_amount=Decimal("3500.00"),
                currency="MAD",
                due_date=today - timedelta(days=5),
                status="PAID",
            )
            db.add(obl_casatech)
            db.flush()
            db.add(Payment(
                obligation_id=obl_casatech.id,
                amount_paid=Decimal("3500.00"),
                currency="MAD",
                payment_method="BANK_TRANSFER",
                transaction_reference="VIR-BMCE-2026-98112",
                paid_at=datetime.now(timezone.utc) - timedelta(days=4),
                recorded_by=users_map["LCVP_FNL"].id,
            ))

        # Risk register
        risk_visa = db.query(RiskRegisterEntry).filter(RiskRegisterEntry.title == "Moroccan Visa Processing Delay for Non-Exempt EPs").first()
        if not risk_visa:
            db.add(RiskRegisterEntry(
                risk_category="LEGAL",
                title="Moroccan Visa Processing Delay for Non-Exempt EPs",
                description="Consular delays in non-visa-exempt territories can breach candidate start dates.",
                probability=3,
                impact=4,
                severity_score=12,
                mitigation_plan="Mandate official consular invitation letters issued at least 60 days before start date.",
                owner_id=users_map["LCVP_ICX"].id,
                status="MONITORED",
            ))

        # IAC audit item
        iac_item = db.query(IACAuditItem).filter(IACAuditItem.check_item == "Signed B2B Contract Archiving").first()
        if not iac_item:
            db.add(IACAuditItem(
                audit_cycle="2026-Q1-ICX-AUDIT",
                check_item="Signed B2B Contract Archiving",
                category="CONTRACTS",
                description="All active opportunities must reference a signed, non-expired B2B contract.",
                is_mandatory=True,
                compliance_status="VERIFIED",
                audited_by=users_map["LCVP_FNL"].id,
                audited_at=datetime.now(timezone.utc) - timedelta(days=1),
            ))

        # Legal document
        leg_doc = db.query(LegalDocument).filter(LegalDocument.title == "B2B Framework Contract Casatech 2026").first()
        if not leg_doc:
            db.add(LegalDocument(
                document_category="CONTRACT",
                title="B2B Framework Contract Casatech 2026",
                entity_id=org_casatech.id,
                file_url="https://docs.aiesec.org.ma/legal/B2B-Framework-Casatech-2026.pdf",
                valid_from=today,
                valid_until=today + timedelta(days=365),
                is_signed=True,
                uploaded_by=users_map["LCVP_FNL"].id,
            ))
        db.flush()

        # 13. KNOWLEDGE BASE & AI COPILOTS
        print("-> Seeding Grounded Policy RAG Documents...")
        k_doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.document_code == "GLOBAL-COMPENDIUM-2026").first()
        if not k_doc:
            k_doc = KnowledgeDocument(
                document_code="GLOBAL-COMPENDIUM-2026",
                title="AIESEC Global Compendium 2026 - iCX Principles & Standards",
                category="GLOBAL_POLICY",
                version="2026.1",
                effective_date=date(2026, 1, 1),
                raw_text="The Global Compendium mandates 18 Exchange Standards for incoming exchanges, 13 of which are strictly mandatory. No AIESEC entity may act as a hosting organization.",
            )
            db.add(k_doc)
            db.flush()
            db.add(KnowledgeChunk(
                document_id=k_doc.id,
                chunk_index=1,
                section_heading="Section 4.2 - Host Organization Eligibility",
                content="Under Section 4.2, no local committee, national member committee, or internal AIESEC legal vehicle may act as the hosting organization for iGV, iGTa, or iGTe participants.",
                metadata_tags={"module": "PRM", "topic": "host_eligibility"},
                token_count=35,
            ))
            db.add(KnowledgeChunk(
                document_id=k_doc.id,
                chunk_index=2,
                section_heading="Section 7.1 - Exchange Standards & Completion Criteria",
                content="An exchange achieves official completion only when at least 16 out of 18 standards are fulfilled, and all 13 mandatory standards are strictly verified.",
                metadata_tags={"module": "CXP", "topic": "completion_criteria"},
                token_count=32,
            ))

        # Approval Proposal
        prop = db.query(ApprovalProposal).filter(ApprovalProposal.agent_name == "EP_SCREENING_COPILOT").first()
        if not prop:
            prop = ApprovalProposal(
                proposed_by=users_map["LCVP_ICX"].id,
                agent_name="EP_SCREENING_COPILOT",
                proposal_type="STATUS_MUTATION",
                target_entity_type="APPLICATION",
                target_entity_id=app_yasmine.id,
                proposed_action="PROMOTE_TO_APPROVED",
                proposed_payload={"operational_readiness": "READY"},
                rationale="Candidate Yasmine Benali has verified CV, completed background screening, and positive interview score.",
                status="PENDING_HUMAN_REVIEW",
            )
            db.add(prop)
        db.flush()

        # 14. TEMPORAL WORKFLOWS & EXPA STAGING
        print("-> Seeding Temporal Durable Workflows & EXPA Reconciliation Records...")
        wf = db.query(TemporalWorkflowExecution).filter(TemporalWorkflowExecution.workflow_id == "WF-SLA-FIRST-CONTACT-YASMINE").first()
        if not wf:
            wf = TemporalWorkflowExecution(
                workflow_id="WF-SLA-FIRST-CONTACT-YASMINE",
                workflow_type="SLA_FIRST_CONTACT",
                entity_type="APPLICATION",
                entity_id=app_yasmine.id,
                status="RUNNING",
                due_at=datetime.now(timezone.utc) + timedelta(hours=24),
                current_step="MONITORING_FIRST_CONTACT_SLA",
            )
            db.add(wf)
            db.flush()
            db.add(TemporalActivityLog(
                execution_id=wf.id,
                activity_name="INITIATE_SLA_CLOCK",
                idempotency_key=f"INIT-SLA-FIRST-CONTACT-{app_yasmine.id}",
                status="SUCCESS",
                result_payload={"sla_hours": 48},
            ))

        sync_run = db.query(EXPASyncRun).first()
        if not sync_run:
            sync_run = EXPASyncRun(
                sync_mode="POLLING",
                status="SUCCESS",
                records_scanned=24,
                records_staged=2,
                conflicts_detected=1,
                completed_at=datetime.now(timezone.utc),
            )
            db.add(sync_run)
            db.flush()
            staged_rec = EXPAStagedRecord(
                sync_run_id=sync_run.id,
                entity_type="APPLICATION",
                expa_id="EXPA-APP-998877",
                raw_payload={"status": "matched", "ep_name": "Lucas Muller", "opportunity_id": "OPP-9911"},
                status="CONFLICT_DETECTED",
            )
            db.add(staged_rec)
            db.flush()
            db.add(EXPAReconciliationRecord(
                staged_record_id=staged_rec.id,
                entity_type="APPLICATION",
                local_entity_id=app_lucas.id,
                field_name="status",
                local_value="APPROVED",
                expa_value="matched",
                discrepancy_type="STATUS_MISMATCH",
                resolution_status="PENDING",
            ))

        db.commit()
        print("✅ Seeding completed successfully! Synthetic database is fully operational.")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed with error: {e}")
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
