from typing import List, Tuple, Optional
from decimal import Decimal
from app.modules.opportunities.schemas import OpportunityCreate, OpportunityUpdate


class ProductValidationResult:
    def __init__(self, is_valid: bool, issues: List[str], duration_tier: Optional[str] = None):
        self.is_valid = is_valid
        self.issues = issues
        self.duration_tier = duration_tier


class ProductValidators:
    @staticmethod
    def validate_igv(data: OpportunityCreate) -> ProductValidationResult:
        """
        iGV (Incoming Global Volunteer) Invariants:
        1. Modality: Strictly PHYSICAL only.
        2. Duration: 4 to 8 weeks.
        3. Working hours: 25 to 40 hours per week.
        4. Remuneration: Strictly unpaid.
        5. SDG Alignment: 1 to 17 with Global Project Name.
        """
        issues: List[str] = []

        if data.modality != "PHYSICAL":
            issues.append(f"iGV modality must be PHYSICAL only (received: {data.modality})")

        if not (4 <= data.duration_weeks <= 8):
            issues.append(f"iGV duration must be between 4 and 8 weeks (received: {data.duration_weeks})")

        if not (25 <= data.working_hours_per_week <= 40):
            issues.append(f"iGV working hours must be between 25 and 40 hours/week (received: {data.working_hours_per_week})")

        if not data.igv_details:
            issues.append("iGV details (SDG alignment and Global Project) are required")
        else:
            if not (1 <= data.igv_details.sdg_number <= 17):
                issues.append(f"iGV SDG number must be between 1 and 17 (received: {data.igv_details.sdg_number})")
            if not data.igv_details.global_project_name or len(data.igv_details.global_project_name.strip()) == 0:
                issues.append("iGV global_project_name is required")

        return ProductValidationResult(is_valid=len(issues) == 0, issues=issues)

    @staticmethod
    def validate_igta(data: OpportunityCreate) -> ProductValidationResult:
        """
        iGTa (Incoming Global Talent) Invariants:
        1. Modality: PHYSICAL, PARTLY_REMOTE, or FULLY_REMOTE.
        2. Duration: 6 to 78 weeks.
        3. Hours: 35 to 45 hours per week.
        4. Work fields: BA, BD, MKT, IT, ENG, FIN, Other.
        5. Compensation:
           - <= 8 weeks: salary > 0 OR accommodation_covered == True
           - > 8 weeks: salary > 0 covering living costs is mandatory
        """
        issues: List[str] = []

        if not (6 <= data.duration_weeks <= 78):
            issues.append(f"iGTa duration must be between 6 and 78 weeks (received: {data.duration_weeks})")

        if not (35 <= data.working_hours_per_week <= 45):
            issues.append(f"iGTa working hours must be between 35 and 45 hours/week (received: {data.working_hours_per_week})")

        # Determine tier
        if data.duration_weeks <= 12:
            duration_tier = "SHORT"
        elif data.duration_weeks <= 26:
            duration_tier = "MEDIUM"
        else:
            duration_tier = "LONG"

        if not data.igt_details:
            issues.append("iGTa details (work_field, salary, accommodation) are required")
        else:
            if data.igt_details.work_field not in ("BA", "BD", "MKT", "IT", "ENG", "FIN", "Other"):
                issues.append(f"Invalid work field: {data.igt_details.work_field}")

            salary = data.igt_details.monthly_salary or Decimal("0.00")
            if data.duration_weeks <= 8:
                if salary <= 0 and not data.igt_details.accommodation_covered:
                    issues.append("For short iGTa (6-8 weeks), either monthly salary or accommodation is mandatory")
            else:
                if salary <= 0:
                    issues.append("For iGTa exceeding 8 weeks, a monthly salary covering living costs is mandatory")
                if not data.igt_details.salary_covers_living_costs:
                    issues.append("For iGTa exceeding 8 weeks, salary_covers_living_costs must be confirmed")

        return ProductValidationResult(is_valid=len(issues) == 0, issues=issues, duration_tier=duration_tier)

    @staticmethod
    def validate_igte(data: OpportunityCreate) -> ProductValidationResult:
        """
        iGTe (Incoming Global Teacher) Invariants:
        1. Modality: PHYSICAL, PARTLY_REMOTE, or FULLY_REMOTE.
        2. Duration: 6 to 78 weeks.
        3. Hours: 35 to 45 hours per week.
        4. Mandatory salary for ALL durations (salary > 0).
        5. Host must be an accredited educational institution.
        6. Role must be confirmed as teaching.
        """
        issues: List[str] = []

        if not (6 <= data.duration_weeks <= 78):
            issues.append(f"iGTe duration must be between 6 and 78 weeks (received: {data.duration_weeks})")

        if not (35 <= data.working_hours_per_week <= 45):
            issues.append(f"iGTe working hours must be between 35 and 45 hours/week (received: {data.working_hours_per_week})")

        # Determine tier
        if data.duration_weeks <= 12:
            duration_tier = "SHORT"
        elif data.duration_weeks <= 26:
            duration_tier = "MEDIUM"
        else:
            duration_tier = "LONG"

        if not data.igt_details:
            issues.append("iGTe details (teaching role, accreditation, salary) are required")
        else:
            salary = data.igt_details.monthly_salary or Decimal("0.00")
            if salary <= 0:
                issues.append("iGTe requires a mandatory monthly salary for all durations")

            if not data.igt_details.accredited_institution:
                issues.append("iGTe host organization must be verified as an accredited educational institution")

            if not data.igt_details.is_teaching_role:
                issues.append("iGTe role must be classified as a teaching role")

        return ProductValidationResult(is_valid=len(issues) == 0, issues=issues, duration_tier=duration_tier)

    @staticmethod
    def validate(data: OpportunityCreate) -> ProductValidationResult:
        if data.product_type == "iGV":
            return ProductValidators.validate_igv(data)
        elif data.product_type == "iGTa":
            return ProductValidators.validate_igta(data)
        elif data.product_type == "iGTe":
            return ProductValidators.validate_igte(data)
        else:
            return ProductValidationResult(is_valid=False, issues=[f"Unknown product type: {data.product_type}"])
