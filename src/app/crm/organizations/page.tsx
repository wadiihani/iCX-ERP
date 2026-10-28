'use client';

import React, { useState } from 'react';
import { LeadImportModal } from '@/components/crm/lead-import-modal';
import { ICEInput } from '@/components/crm/ice-input';

interface OrganizationItem {
  id: string;
  name: string;
  ice_number: string;
  city: string;
  lead_status: 'uncontacted' | 'contacted' | 'meeting_scheduled' | 'qualified';
  lead_score: number;
  contact_person: string;
}

const INITIAL_ORGS: OrganizationItem[] = [
  {
    id: 'org-1',
    name: 'Fondation Orient-Occident',
    ice_number: '001524316000045',
    city: 'Rabat',
    lead_status: 'qualified',
    lead_score: 92,
    contact_person: 'Nadia El Fassi',
  },
  {
    id: 'org-2',
    name: 'Association Solidarité Féminine',
    ice_number: '002194821000012',
    city: 'Rabat',
    lead_status: 'meeting_scheduled',
    lead_score: 78,
    contact_person: 'Amina Benali',
  },
  {
    id: 'org-3',
    name: 'École Al-Amal pour l’Éducation',
    ice_number: '003481290000088',
    city: 'Salé',
    lead_status: 'contacted',
    lead_score: 65,
    contact_person: 'Youssef Mansouri',
  },
];

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>(INITIAL_ORGS);
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIce, setNewOrgIce] = useState('');
  const [isIceValid, setIsIceValid] = useState(false);
  const [newOrgCity, setNewOrgCity] = useState('Rabat');
  const [newOrgContact, setNewOrgContact] = useState('');

  const filtered = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.ice_number.includes(search) ||
      org.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !isIceValid) return;

    const newOrg: OrganizationItem = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      ice_number: newOrgIce,
      city: newOrgCity,
      lead_status: 'uncontacted',
      lead_score: 50,
      contact_person: newOrgContact || 'Unassigned',
    };

    setOrganizations([newOrg, ...organizations]);
    setIsCreateModalOpen(false);
    setNewOrgName('');
    setNewOrgIce('');
    setNewOrgContact('');
    setNotification(`Organization "${newOrg.name}" successfully created with verified ICE.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImportSuccess = (batchId: string, count: number) => {
    setNotification(`Successfully committed batch ${batchId} (${count} net new leads imported).`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Entity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span>LC Rabat</span>
              <span>/</span>
              <span>CRM & Stakeholders</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">Organizations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Partner Organizations & Lead Registry
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
            >
              <span className="mr-2">📥</span> Import Leads (CSV/XLSX)
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <span className="mr-1.5">+</span> Add Partner Organization
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-500 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Directory Search & Filters */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ICE number, or city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Showing {filtered.length} of {organizations.length} organizations</span>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Organization Name</th>
                <th className="p-4 font-semibold">ICE Number (Morocco)</th>
                <th className="p-4 font-semibold">City</th>
                <th className="p-4 font-semibold">Lead Status</th>
                <th className="p-4 font-semibold">Lead Score</th>
                <th className="p-4 font-semibold">Contact Person</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {org.name}
                  </td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                    {org.ice_number}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {org.city}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        org.lead_status === 'qualified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : org.lead_status === 'meeting_scheduled'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {org.lead_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">{org.lead_score}</span> / 100
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {org.contact_person}
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lead Import Modal */}
        <LeadImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={handleImportSuccess}
        />

        {/* Create Organization Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Partner Organization
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Fondation Orient-Occident"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500"
                  />
                </div>

                <ICEInput
                  value={newOrgIce}
                  onChange={(val, valid) => {
                    setNewOrgIce(val);
                    setIsIceValid(valid);
                  }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</label>
                    <input
                      type="text"
                      value={newOrgCity}
                      onChange={(e) => setNewOrgCity(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Contact</label>
                    <input
                      type="text"
                      value={newOrgContact}
                      onChange={(e) => setNewOrgContact(e.target.value)}
                      placeholder="e.g. Lead Director"
                      className="mt-1 w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newOrgName || !isIceValid}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition shadow-sm"
                  >
                    Save Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
