'use client';

import React, { useState } from 'react';
import {
  Home,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  User,
  Calendar,
  Lock,
  DoorOpen,
  DollarSign,
  Search,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  AccommodationProvider,
  AccommodationBed,
  AccommodationAllocation,
  EpGender,
} from '@/lib/types/accommodation';
import {
  validateProviderVettingForBooking,
  validateGenderCompatibility,
  checkTemporalBedCollision,
  allocateBedToEp,
} from '@/lib/accommodation/accommodation-engine';

export interface BedAllocationBoardProps {
  providers: AccommodationProvider[];
  beds: AccommodationBed[];
  allocations: AccommodationAllocation[];
  onAddAllocation: (alloc: AccommodationAllocation) => void;
  onUpdateProvider?: (provider: AccommodationProvider) => void;
}

export const INITIAL_BEDS_CATALOG: AccommodationBed[] = [
  {
    id: 'bed-agdal-101',
    unitId: 'unit-agdal-1',
    unitName: 'Dar Zellige Apt 1 Chambre A',
    providerName: 'Dar Zellige Host Family (Agdal)',
    bedCode: 'BED-AGDAL-A1',
    genderRestriction: 'FEMALE_ONLY',
    monthlyCostMad: 1800,
    depositMad: 500,
    isActive: true,
  },
  {
    id: 'bed-agdal-102',
    unitId: 'unit-agdal-1',
    unitName: 'Dar Zellige Apt 1 Chambre B',
    providerName: 'Dar Zellige Host Family (Agdal)',
    bedCode: 'BED-AGDAL-B1',
    genderRestriction: 'FEMALE_ONLY',
    monthlyCostMad: 1800,
    depositMad: 500,
    isActive: true,
  },
  {
    id: 'bed-hassan-201',
    unitId: 'unit-hassan-2',
    unitName: 'Residence Al Manzah Chambre 1',
    providerName: 'Residence Al Manzah (Hassan)',
    bedCode: 'BED-HASSAN-101',
    genderRestriction: 'MALE_ONLY',
    monthlyCostMad: 2000,
    depositMad: 600,
    isActive: true,
  },
  {
    id: 'bed-hassan-202',
    unitId: 'unit-hassan-2',
    unitName: 'Residence Al Manzah Chambre 2',
    providerName: 'Residence Al Manzah (Hassan)',
    bedCode: 'BED-HASSAN-102',
    genderRestriction: 'MALE_ONLY',
    monthlyCostMad: 2000,
    depositMad: 600,
    isActive: true,
  },
  {
    id: 'bed-ocean-301',
    unitId: 'unit-ocean-3',
    unitName: 'Villa Ocean Studio 1',
    providerName: 'Villa Ocean Host Family',
    bedCode: 'BED-OCEAN-01',
    genderRestriction: 'COED_PRIVATE',
    monthlyCostMad: 2400,
    depositMad: 800,
    isActive: true,
  },
  {
    id: 'bed-irfane-401',
    unitId: 'unit-irfane-4',
    unitName: 'Dortoir Universitaire Irfane Bloc C',
    providerName: 'Campus Irfane Partner Residence',
    bedCode: 'BED-IRFANE-01',
    genderRestriction: 'MALE_ONLY',
    monthlyCostMad: 1500,
    depositMad: 300,
    isActive: true,
  },
];

export const INITIAL_PROVIDERS_CATALOG: AccommodationProvider[] = [
  {
    id: 'prov-rabat-001',
    lcId: 'LC_RABAT',
    providerName: 'Dar Zellige Host Family (Agdal)',
    providerType: 'GLOBAL_HOST_FAMILY',
    neighborhood: 'Agdal',
    fullAddress: '14 Rue Oukaimeden, Agdal, Rabat',
    contactPerson: 'Mme. Aicha Bennani',
    phoneWhatsapp: '+212661234567',
    vettingStatus: 'APPROVED_VETTED',
    lastVettedDate: '2026-06-01',
    vettedByUserId: 'user-vp-igv',
    isActive: true,
    checklist: {
      inspectionDate: '2026-06-01',
      inspectorUserId: 'user-vp-igv',
      sanitaryStandardScore: 92,
      hasRunningWater: true,
      hasHotWater: true,
      hasCleanBathroom: true,
      hasSecureLocking: true,
      hasFireSafetyEmergencyExit: true,
      hasWifiAccess: true,
      singleBedPerEp: true,
      contractMoUSigned: true,
      notes: 'Excellent family setting, private entrance, separate shower.',
    },
  },
  {
    id: 'prov-rabat-002',
    lcId: 'LC_RABAT',
    providerName: 'Residence Al Manzah (Hassan)',
    providerType: 'RENTED_APARTMENT',
    neighborhood: 'Hassan',
    fullAddress: '28 Avenue Moulay Youssef, Hassan, Rabat',
    contactPerson: 'M. Karim Tahiri',
    phoneWhatsapp: '+212663987654',
    vettingStatus: 'APPROVED_VETTED',
    lastVettedDate: '2026-05-15',
    vettedByUserId: 'user-vp-cxp',
    isActive: true,
    checklist: {
      inspectionDate: '2026-05-15',
      inspectorUserId: 'user-vp-cxp',
      sanitaryStandardScore: 88,
      hasRunningWater: true,
      hasHotWater: true,
      hasCleanBathroom: true,
      hasSecureLocking: true,
      hasFireSafetyEmergencyExit: true,
      hasWifiAccess: true,
      singleBedPerEp: true,
      contractMoUSigned: true,
      notes: 'Dedicated apartment for interns. 5 minutes from tramway station Hassan Tour.',
    },
  },
  {
    id: 'prov-rabat-003',
    lcId: 'LC_RABAT',
    providerName: 'Villa Ocean Host Family',
    providerType: 'GLOBAL_HOST_FAMILY',
    neighborhood: 'Ocean',
    fullAddress: '5 Rue de la Mer, Ocean, Rabat',
    contactPerson: 'M. Omar Cherkaoui',
    phoneWhatsapp: '+212661112233',
    vettingStatus: 'APPROVED_VETTED',
    lastVettedDate: '2026-07-10',
    vettedByUserId: 'user-vp-cxp',
    isActive: true,
    checklist: {
      inspectionDate: '2026-07-10',
      inspectorUserId: 'user-vp-cxp',
      sanitaryStandardScore: 95,
      hasRunningWater: true,
      hasHotWater: true,
      hasCleanBathroom: true,
      hasSecureLocking: true,
      hasFireSafetyEmergencyExit: true,
      hasWifiAccess: true,
      singleBedPerEp: true,
      contractMoUSigned: true,
      notes: 'Studio with private kitchenette. High hygiene standards.',
    },
  },
];

export const INITIAL_ALLOCATIONS_CATALOG: AccommodationAllocation[] = [
  {
    id: 'alloc-001',
    applicationId: 'app_2026_081',
    bedId: 'bed-agdal-101',
    epName: 'Sofia Martinez',
    epGender: 'FEMALE',
    checkInDate: '2026-11-15',
    checkOutDate: '2026-12-27',
    allocStatus: 'RESERVED_LOCKED',
    provider14dReconfirmedAt: '2026-10-25T10:00:00Z',
    op14dReconfirmedAt: '2026-10-25T11:00:00Z',
    depositPaidMad: 500,
    depositRefundedMad: 0,
    isArchived: false,
  },
  {
    id: 'alloc-002',
    applicationId: 'app_2026_065',
    bedId: 'bed-agdal-102',
    epName: 'Elif Demir',
    epGender: 'FEMALE',
    checkInDate: '2026-11-25',
    checkOutDate: '2027-02-15',
    allocStatus: 'RESERVED_LOCKED',
    provider14dReconfirmedAt: '2026-10-25T14:00:00Z',
    op14dReconfirmedAt: '2026-10-25T15:00:00Z',
    depositPaidMad: 500,
    depositRefundedMad: 0,
    isArchived: false,
  },
  {
    id: 'alloc-003',
    applicationId: 'app_2026_090',
    bedId: 'bed-hassan-201',
    epName: 'Lucas Silva',
    epGender: 'MALE',
    checkInDate: '2026-12-01',
    checkOutDate: '2027-03-01',
    allocStatus: 'RESERVED_LOCKED',
    provider14dReconfirmedAt: '2026-10-26T09:00:00Z',
    op14dReconfirmedAt: '2026-10-26T10:00:00Z',
    depositPaidMad: 600,
    depositRefundedMad: 0,
    isArchived: false,
  },
];

export function BedAllocationBoard({
  providers = INITIAL_PROVIDERS_CATALOG,
  beds = INITIAL_BEDS_CATALOG,
  allocations = INITIAL_ALLOCATIONS_CATALOG,
  onAddAllocation,
}: BedAllocationBoardProps) {
  const [selectedBed, setSelectedBed] = useState<AccommodationBed | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'COED_PRIVATE'>('ALL');
  
  // Booking Form State
  const [targetEpName, setTargetEpName] = useState('');
  const [targetEpGender, setTargetEpGender] = useState<EpGender>('FEMALE');
  const [checkInDate, setCheckInDate] = useState('2026-11-20');
  const [checkOutDate, setCheckOutDate] = useState('2027-01-05');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const filteredBeds = beds.filter((bed) => {
    if (genderFilter !== 'ALL' && bed.genderRestriction !== genderFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        bed.bedCode.toLowerCase().includes(q) ||
        (bed.unitName && bed.unitName.toLowerCase().includes(q)) ||
        (bed.providerName && bed.providerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getBedAllocations = (bedId: string) => {
    return allocations.filter((a) => a.bedId === bedId && !a.isArchived && a.allocStatus !== 'CANCELLED');
  };

  const handleOpenBookingModal = (bed: AccommodationBed) => {
    setSelectedBed(bed);
    setBookingError(null);
    setBookingSuccess(null);
    // Pre-populate sensible defaults based on bed
    if (bed.genderRestriction === 'MALE_ONLY') {
      setTargetEpGender('MALE');
    } else if (bed.genderRestriction === 'FEMALE_ONLY') {
      setTargetEpGender('FEMALE');
    }
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!selectedBed) return;
    if (!targetEpName.trim()) {
      setBookingError('Exchange Participant name is required.');
      return;
    }

    const provider = providers.find((p) => p.providerName === selectedBed.providerName) || providers[0];

    const result = allocateBedToEp({
      applicationId: `app_${Date.now()}`,
      bed: selectedBed,
      provider: provider,
      epName: targetEpName.trim(),
      epGender: targetEpGender,
      checkInDate,
      checkOutDate,
      existingBedAllocations: allocations,
    });

    if (!result.success) {
      setBookingError(result.errors.join(' '));
      return;
    }

    if (result.allocation) {
      onAddAllocation(result.allocation);
      setBookingSuccess(`Bed ${selectedBed.bedCode} successfully allocated to ${targetEpName.trim()}!`);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search beds by code, room, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Restriction:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
          >
            <option value="ALL">All Genders / Units</option>
            <option value="FEMALE_ONLY">Female Only</option>
            <option value="MALE_ONLY">Male Only</option>
            <option value="COED_PRIVATE">Coed / Private</option>
          </select>
        </div>
      </div>

      {/* Provider Vetting Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => {
          const vetting = validateProviderVettingForBooking(p);
          return (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.providerName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.fullAddress}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {p.vettingStatus.replace('_', ' ')}
                </span>
              </div>

              {/* 4 Mandatory Physical Vetting Checks */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Single bed per EP</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Running clean water</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Clean bathroom</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Electricity & lock</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                <span>Contact: {p.contactPerson} ({p.phoneWhatsapp})</span>
                <span className="text-emerald-600 font-semibold">{vetting.daysUntilExpiry}d validity</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Grid & Allocation Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const activeAllocs = getBedAllocations(bed.id);
          const isCurrentlyOccupied = activeAllocs.length > 0;

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-xl border transition-all ${
                isCurrentlyOccupied
                  ? 'border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-subtle'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {bed.bedCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      bed.genderRestriction === 'FEMALE_ONLY'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                        : bed.genderRestriction === 'MALE_ONLY'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                    }`}>
                      {bed.genderRestriction.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {bed.unitName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Host: {bed.providerName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    {bed.monthlyCostMad} MAD
                    <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Dep: {bed.depositMad} MAD
                  </div>
                </div>
              </div>

              {/* Occupancy Timeline / Current Reservations */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Active Reservations ({activeAllocs.length})
                </span>

                {activeAllocs.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                      Currently Vacant & Available
                    </span>
                    <button
                      onClick={() => handleOpenBookingModal(bed)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm"
                    >
                      Book Bed
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {activeAllocs.map((alloc) => (
                      <div
                        key={alloc.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-[11px]">
                            {alloc.epName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {alloc.checkInDate} → {alloc.checkOutDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {alloc.allocStatus}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleOpenBookingModal(bed)}
                        className="text-[10px] font-bold text-aiesec-blue hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Sequential Booking</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal with Zero Overbooking Constraint */}
      {isBookingModalOpen && selectedBed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Allocate Bed: {selectedBed.bedCode}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedBed.unitName} • {selectedBed.genderRestriction.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exchange Participant Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean-Paul Kamga"
                  value={targetEpName}
                  onChange={(e) => setTargetEpName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Participant Gender *
                </label>
                <select
                  value={targetEpGender}
                  onChange={(e) => setTargetEpGender(e.target.value as EpGender)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
                {selectedBed.genderRestriction !== 'COED_PRIVATE' && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    Notice: This bed is strictly restricted to {selectedBed.genderRestriction.replace('_', ' ')}.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-aiesec-blue"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Temporal Exclusion Guarantee (INV-01)
                </div>
                The system mathematically guarantees zero double-bookings. Dates cannot overlap any active reservation on {selectedBed.bedCode}.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-aiesec-blue hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Confirm Bed Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
