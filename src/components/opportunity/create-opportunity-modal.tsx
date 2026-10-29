'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  DollarSign,
  Briefcase,
  GraduationCap,
  Heart,
  Globe2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { OpportunityInput } from '@/lib/opportunity/opportunity-validator';
import {
  OFFICIAL_GV_PROJECTS,
  IGTA_FUNCTIONAL_FIELDS,
  IGTE_SUBJECTS,
  IGTE_TEACHING_LEVELS,
  SDG_CATALOG,
  INITIAL_B2B_CONTRACTS,
} from '@/lib/opportunity/opportunity-portfolio-data';
import {
  validateOpportunityPortfolio,
  STATUTORY_MOROCCAN_MIN_SALARY_MAD,
} from '@/lib/opportunity/opportunity-portfolio-validator';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (input: OpportunityInput) => void;
  organizations?: Array<{ id: string; name: string }>;
}

export function CreateOpportunityModal({
  isOpen,
  onClose,
  onCreated,
  organizations = [
    { id: 'org_rabat_001', name: 'BMCE Bank Foundation' },
    { id: 'org_rabat_002', name: 'Rabat American School' },
    { id: 'org_rabat_003', name: 'Casatech Innovation Labs' },
  ],
}: CreateOpportunityModalProps) {
  // Product state
  const [product, setProduct] = useState<'igv' | 'igt' | 'igte'>('igv');

  // Common fields
  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? '');
  const [contractId, setContractId] = useState(INITIAL_B2B_CONTRACTS[0]?.id ?? '');
  const [totalOpenings, setTotalOpenings] = useState<number>(3);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-12-15');
  const [modality, setModality] = useState<'PHYSICAL' | 'PARTLY_REMOTE'>('PHYSICAL');
  const [remoteWeeks, setRemoteWeeks] = useState<number>(0);
  const [icbAuditUrl, setIcbAuditUrl] = useState('');

  // iGV Specifics
  const [selectedGvProject, setSelectedGvProject] = useState(OFFICIAL_GV_PROJECTS[2]?.id); // Global Classroom default
  const [primarySdg, setPrimarySdg] = useState<number>(4);
  const [secondarySdgs, setSecondarySdgs] = useState<number[]>([1, 8]);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(
    'Public school students aged 8-16 in priority education zones'
  );
  const [plannedActivities, setPlannedActivities] = useState<string[]>([
    'Interactive English & French communication clubs',
    'Digital literacy and introductory coding basics',
  ]);
  const [newActivityInput, setNewActivityInput] = useState('');
  const [expectedOutputs, setExpectedOutputs] = useState(
    '100+ students completing 24 hours of interactive language and digital modules.'
  );
  const [fundingPercentage, setFundingPercentage] = useState<number>(100);

  // iGTa Specifics
  const [professionalField, setProfessionalField] = useState<string>('INFORMATION_TECHNOLOGY');
  const [igtaSalaryMad, setIgtaSalaryMad] = useState<number>(5000);
  const [supervisorName, setSupervisorName] = useState('Mehdi Alami');
  const [supervisorTitle, setSupervisorTitle] = useState('Senior Technical Director');

  // iGTe Specifics
  const [teachingSubject, setTeachingSubject] = useState<string>('STEM_EDUCATION');
  const [teachingLevel, setTeachingLevel] = useState<string>('MIDDLE_SCHOOL');
  const [curriculumOutline, setCurriculumOutline] = useState(
    'Hands-on robotics, coding, and scientific inquiry workshops for middle schoolers.'
  );
  const [igteSalaryMad, setIgteSalaryMad] = useState<number>(5500);

  // Duration & Working hours depending on product defaults
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState<number>(30);

  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  // Handler when product changes to set appropriate statutory defaults
  const handleProductChange = (newProduct: 'igv' | 'igt' | 'igte') => {
    setProduct(newProduct);
    setErrors([]);
    if (newProduct === 'igv') {
      setDurationWeeks(6);
      setWeeklyWorkingHours(30);
    } else if (newProduct === 'igt') {
      setDurationWeeks(24);
      setWeeklyWorkingHours(40);
    } else if (newProduct === 'igte') {
      setDurationWeeks(16);
      setWeeklyWorkingHours(35);
    }
  };

  // Handler when iGV project is picked
  const handleSelectGvProject = (projId: string) => {
    setSelectedGvProject(projId);
    const found = OFFICIAL_GV_PROJECTS.find((p) => p.id === projId);
    if (found) {
      setTitle(`${found.name}: Moroccan Impact Initiative`);
      setPrimarySdg(found.primarySdg);
      setSecondarySdgs(found.secondarySdgs);
      setTargetBeneficiaries(found.targetBeneficiaries);
      setPlannedActivities(found.typicalActivities);
      setExpectedOutputs(found.expectedOutputs);
    }
  };

  const handleAddActivity = () => {
    if (newActivityInput.trim()) {
      setPlannedActivities([...plannedActivities, newActivityInput.trim()]);
      setNewActivityInput('');
    }
  };

  const handleRemoveActivity = (idx: number) => {
    setPlannedActivities(plannedActivities.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOrg = organizations.find((o) => o.id === organizationId);
    const currentGvProject = OFFICIAL_GV_PROJECTS.find((p) => p.id === selectedGvProject);

    const validationPayload = {
      title,
      product,
      organizationId,
      contractId,
      durationWeeks,
      weeklyWorkingHours,
      totalOpenings,
      modality,
      remoteWeeks: modality === 'PARTLY_REMOTE' ? remoteWeeks : 0,
      icbAuditUrl: modality === 'PARTLY_REMOTE' ? icbAuditUrl : undefined,
      portfolioProject: product === 'igv' ? currentGvProject?.name : undefined,
      primarySdg: product === 'igv' ? primarySdg : undefined,
      secondarySdgs: product === 'igv' ? secondarySdgs : undefined,
      targetBeneficiaries: product === 'igv' ? targetBeneficiaries : undefined,
      plannedActivities: product === 'igv' ? plannedActivities : undefined,
      expectedOutputs: product === 'igv' ? expectedOutputs : undefined,
      fundingPercentage: product === 'igv' ? fundingPercentage : 100,
      monthlySalaryMad:
        product === 'igv'
          ? 0
          : product === 'igt'
          ? igtaSalaryMad
          : igteSalaryMad,
      epFeeMad: 0,
      professionalField: product === 'igt' ? professionalField : undefined,
      teachingSubject: product === 'igte' ? teachingSubject : undefined,
      teachingLevel: product === 'igte' ? teachingLevel : undefined,
      curriculumOutline: product === 'igte' ? curriculumOutline : undefined,
      supervisorName,
      supervisorTitle,
    };

    const res = validateOpportunityPortfolio(validationPayload);
    if (!res.isValid) {
      setErrors(res.errors);
      return;
    }

    const output: OpportunityInput = {
      title,
      product,
      organizationId,
      organizationName: selectedOrg?.name || 'Partner Organization',
      contractId,
      subProduct: product === 'igv' ? currentGvProject?.name : professionalField,
      sdgTarget: primarySdg,
      durationWeeks,
      weeklyWorkingHours,
      fundingPercentage,
      totalOpenings,
      startDate,
      endDate,
      modality,
      remoteWeeks: modality === 'PARTLY_REMOTE' ? remoteWeeks : 0,
      icbAuditUrl: modality === 'PARTLY_REMOTE' ? icbAuditUrl : undefined,
      portfolioProject: currentGvProject?.name,
      primarySdg,
      secondarySdgs,
      targetBeneficiaries,
      plannedActivities,
      expectedOutputs,
      monthlySalaryMad:
        product === 'igv'
          ? 0
          : product === 'igt'
          ? igtaSalaryMad
          : igteSalaryMad,
      epFeeMad: 0,
      professionalField,
      teachingSubject,
      teachingLevel,
      curriculumOutline,
      supervisorName,
      supervisorTitle,
    };

    onCreated(output);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-2xl w-full my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Create Official Opportunity</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-aiesec-blue dark:bg-blue-950/40 dark:text-blue-300">
                Hub-Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Governed by 16 Official GV Projects, iGTa/e Statutory Floor (3,500 MAD), and AEPP 4.2.1.4 Benefit Lock.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleProductChange('igv')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              product === 'igv'
                ? 'bg-white text-[#F85A40] shadow-sm font-bold dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="h-4 w-4 text-[#F85A40]" />
            <span>iGV (Volunteer)</span>
          </button>

          <button
            type="button"
            onClick={() => handleProductChange('igt')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              product === 'igt'
                ? 'bg-white text-[#0CB9C1] shadow-sm font-bold dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-4 w-4 text-[#0CB9C1]" />
            <span>iGTa (Talent)</span>
          </button>

          <button
            type="button"
            onClick={() => handleProductChange('igte')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              product === 'igte'
                ? 'bg-white text-[#F48924] shadow-sm font-bold dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-[#F48924]" />
            <span>iGTe (Teacher)</span>
          </button>
        </div>

        {errors.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              <span>Please resolve statutory issues:</span>
            </div>
            {errors.map((err, i) => (
              <div key={i} className="pl-5">• {err}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Partner & Contract selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Host Partner Organization <span className="text-rose-500">*</span>
              </label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Linked B2B Contract / MOU
              </label>
              <select
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {INITIAL_B2B_CONTRACTS.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.contractNumber} ({ct.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUCT SPECIFIC SECTION */}
          {product === 'igv' && (
            <div className="space-y-3 rounded-xl border border-red-100 bg-red-50/20 p-4 dark:border-red-950/40 dark:bg-red-950/10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F85A40] text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Official 16 Global Volunteer Project Portfolio</span>
                </span>
                <span className="text-[10px] text-slate-400">UN SDG Framework</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Choose Official Project Template
                </label>
                <select
                  value={selectedGvProject}
                  onChange={(e) => handleSelectGvProject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  {OFFICIAL_GV_PROJECTS.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} — Primary SDG {proj.primarySdg} ({SDG_CATALOG[proj.primarySdg]?.sdgName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                    Primary UN Goal
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: SDG_CATALOG[primarySdg]?.colorHex }}
                      className="h-5 w-5 rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0"
                    >
                      {primarySdg}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {SDG_CATALOG[primarySdg]?.sdgName}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                    Secondary Goals
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {secondarySdgs.map((sdg) => (
                      <span
                        key={sdg}
                        style={{ backgroundColor: SDG_CATALOG[sdg]?.colorHex }}
                        className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                      >
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Beneficiaries (Impact Group)
                </label>
                <input
                  type="text"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Planned Activities
                </label>
                <div className="space-y-1.5 mb-2">
                  {plannedActivities.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded bg-white px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <span>• {act}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(i)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add specific delivery activity..."
                    value={newActivityInput}
                    onChange={(e) => setNewActivityInput(e.target.value)}
                    className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="rounded bg-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expected Output & Deliverable Evidence Indicators
                </label>
                <input
                  type="text"
                  value={expectedOutputs}
                  onChange={(e) => setExpectedOutputs(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>AEPP Volunteering Rule:</strong> Cash salary is strictly locked to 0 MAD. Duration is limited to 6–8 weeks and 25–40 hours/week.
                </span>
              </div>
            </div>
          )}

          {product === 'igt' && (
            <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/20 p-4 dark:border-teal-950/40 dark:bg-teal-950/10">
              <span className="font-bold text-[#0CB9C1] text-xs flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>iGTa Professional Exchange Specifications</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Functional Field <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={professionalField}
                    onChange={(e) => setProfessionalField(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {IGTA_FUNCTIONAL_FIELDS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Salary (MAD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={STATUTORY_MOROCCAN_MIN_SALARY_MAD}
                    step={100}
                    value={igtaSalaryMad}
                    onChange={(e) => setIgtaSalaryMad(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Floor: {STATUTORY_MOROCCAN_MIN_SALARY_MAD} MAD/mo per Moroccan Labor Code.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Technical Supervisor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Supervisor Role / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={supervisorTitle}
                    onChange={(e) => setSupervisorTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {product === 'igte' && (
            <div className="space-y-3 rounded-xl border border-orange-100 bg-orange-50/20 p-4 dark:border-orange-950/40 dark:bg-orange-950/10">
              <span className="font-bold text-[#F48924] text-xs flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>iGTe Teacher Exchange Specifications</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Academic Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={teachingSubject}
                    onChange={(e) => setTeachingSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {IGTE_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Student Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={teachingLevel}
                    onChange={(e) => setTeachingLevel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {IGTE_TEACHING_LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Curriculum Outline & Pedagogy <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={curriculumOutline}
                  onChange={(e) => setCurriculumOutline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Monthly Salary (MAD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={STATUTORY_MOROCCAN_MIN_SALARY_MAD}
                    step={100}
                    value={igteSalaryMad}
                    onChange={(e) => setIgteSalaryMad(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pedagogical Supervisor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common title & hours */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Opportunity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Global Classroom: Digital Literacy Coach"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min={product === 'igv' ? 6 : product === 'igte' ? 9 : 6}
                max={product === 'igv' ? 8 : 78}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Working Hours/Week
              </label>
              <input
                type="number"
                min={product === 'igv' ? 25 : 35}
                max={product === 'igv' ? 40 : 45}
                value={weeklyWorkingHours}
                onChange={(e) => setWeeklyWorkingHours(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Initial Wave Openings
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalOpenings}
                onChange={(e) => setTotalOpenings(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Modality Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                Exchange Modality
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modality"
                    checked={modality === 'PHYSICAL'}
                    onChange={() => setModality('PHYSICAL')}
                    className="text-aiesec-blue"
                  />
                  <span>100% On-Site (Physical)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="modality"
                    checked={modality === 'PARTLY_REMOTE'}
                    onChange={() => setModality('PARTLY_REMOTE')}
                    className="text-aiesec-blue"
                  />
                  <span>Partly Remote (APIP 5.2)</span>
                </label>
              </div>
            </div>

            {modality === 'PARTLY_REMOTE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Remote Duration (Weeks) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.floor(durationWeeks * 0.5)}
                    value={remoteWeeks}
                    onChange={(e) => setRemoteWeeks(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Max: {Math.floor(durationWeeks * 0.5)} weeks (50% statutory ceiling).
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mandatory ICB Audit Form URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://aies.ec/icb-remote-audit-..."
                    value={icbAuditUrl}
                    onChange={(e) => setIcbAuditUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                First Wave Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                First Wave End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-aiesec-blue px-5 py-2 font-bold text-white shadow-md hover:bg-blue-600 transition"
            >
              Verify & Create Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
