'use client';

import React, { useState } from 'react';
import { B2BOrganization, B2BContact } from '@/lib/crm/organizations-data';
import { B2bDealRecord, PIPELINE_STAGE_CONFIG } from '@/lib/sales/deals-data';
import {
  X,
  Building2,
  Briefcase,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Check,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface PartnerEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partner: B2BOrganization | null;
  deals: B2bDealRecord[];
  contacts: B2BContact[];
  onSavePartner: (updated: B2BOrganization) => void;
  onCreateDeal?: (newDeal: B2bDealRecord) => void;
  onAddContact?: (newContact: B2BContact) => void;
}

export function PartnerEditDrawer({
  isOpen,
  onClose,
  partner,
  deals,
  contacts,
  onSavePartner,
  onCreateDeal,
  onAddContact,
}: PartnerEditDrawerProps) {
  if (!isOpen || !partner) return null;

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DEALS' | 'CONTACTS' | 'DANGER'>('PROFILE');

  // Partner Form State
  const [formData, setFormData] = useState({
    name: partner.name,
    legalName: partner.legalName || partner.name,
    brandName: partner.brandName || '',
    website: partner.website || '',
    sector: partner.sector,
    city: partner.city,
    address: partner.address || '',
    tax_id: partner.tax_id || '',
    ice: partner.ice || '',
    tier: partner.tier,
    status: partner.status,
  });

  // Archive State
  const [archiveReason, setArchiveReason] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  // New Contact inline state
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('');

  // New Deal inline state
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealProduct, setNewDealProduct] = useState<'iGV' | 'iGTa' | 'iGTe' | 'CSR_SPONSOR'>('iGV');
  const [newDealValue, setNewDealValue] = useState<number>(15000);
  const [newDealSlots, setNewDealSlots] = useState<number>(2);

  // Partner's deals & contacts
  const partnerDeals = deals.filter((d) => d.orgId === partner.id);
  const partnerContacts = contacts.filter((c) => c.organization_id === partner.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: B2BOrganization = {
      ...partner,
      ...formData,
      updated_at: new Date().toISOString(),
    };
    onSavePartner(updated);
    onClose();
  };

  const handleArchivePartner = () => {
    if (!archiveReason.trim()) return;
    const updated: B2BOrganization = {
      ...partner,
      isArchived: true,
      archivedReason: archiveReason,
      status: 'CHURNED',
      updated_at: new Date().toISOString(),
    };
    onSavePartner(updated);
    setIsArchiving(false);
    onClose();
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) return;

    const contact: B2BContact = {
      id: `cnt_${Date.now()}`,
      organization_id: partner.id,
      organization_name: partner.name,
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone,
      job_title: newContactRole || 'Account Contact',
      is_primary: partnerContacts.length === 0,
      created_at: new Date().toISOString(),
    };

    if (onAddContact) onAddContact(contact);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactRole('');
    setIsAddingContact(false);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim()) return;

    const deal: B2bDealRecord = {
      id: `deal-${Date.now()}`,
      orgId: partner.id,
      orgName: partner.name,
      title: newDealTitle,
      term: '26.2',
      peak: 'WINTER',
      product: newDealProduct,
      stage: 'QUALIFIED',
      revenueMad: Number(newDealValue) || 0,
      expectedHeadcount: Number(newDealSlots) || 1,
      assignedOwnerId: partner.account_owner_id,
      assignedOwnerName: partner.account_owner_name,
      nextFollowupDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      history: [
        {
          fromStage: 'PROSPECT',
          toStage: 'QUALIFIED',
          timestamp: new Date().toISOString().split('T')[0],
          actorName: partner.account_owner_name,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onCreateDeal) onCreateDeal(deal);
    setNewDealTitle('');
    setIsAddingDeal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs animate-in fade-in-50">
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aiesec-blue/10 text-aiesec-blue font-bold text-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {partner.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Partner Edit Drawer · Moroccan Tax ICE & Multi-Deal Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-2 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`border-b-2 py-2.5 text-xs font-semibold transition ${
              activeTab === 'PROFILE'
                ? 'border-aiesec-blue text-aiesec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Profile & Tax ID
          </button>
          <button
            onClick={() => setActiveTab('DEALS')}
            className={`border-b-2 py-2.5 text-xs font-semibold transition ${
              activeTab === 'DEALS'
                ? 'border-aiesec-blue text-aiesec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Active Deals ({partnerDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`border-b-2 py-2.5 text-xs font-semibold transition ${
              activeTab === 'CONTACTS'
                ? 'border-aiesec-blue text-aiesec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Contacts ({partnerContacts.length})
          </button>
          <button
            onClick={() => setActiveTab('DANGER')}
            className={`border-b-2 py-2.5 text-xs font-semibold transition ${
              activeTab === 'DANGER'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600 dark:text-slate-400'
            }`}
          >
            Archiving
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: PROFILE & TAX */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Legal Corporate Name
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand / Acronym
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="e.g. BMCE, RAS"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Moroccan ICE (15 digits)
                  </label>
                  <input
                    type="text"
                    value={formData.ice}
                    onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
                    placeholder="001524389000082"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Identifiant Fiscal (IF)
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    placeholder="MA-09283711"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sector
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="EDUCATION">Education</option>
                    <option value="FINANCE">Finance</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="CONSULTING">Consulting</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="NGO">NGO / Civil Society</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-2xs focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-aiesec-blue px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition"
                >
                  Save Partner Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACTIVE DEALS */}
          {activeTab === 'DEALS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Associated Deals ({partnerDeals.length})
                </span>
                <button
                  onClick={() => setIsAddingDeal(!isAddingDeal)}
                  className="flex items-center gap-1 rounded-md bg-aiesec-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600 transition"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Deal</span>
                </button>
              </div>

              {/* Inline Create Deal Form */}
              {isAddingDeal && (
                <form
                  onSubmit={handleCreateDeal}
                  className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 space-y-3 dark:border-blue-900 dark:bg-blue-950/20"
                >
                  <div className="font-bold text-xs text-aiesec-blue">Create Deal for {partner.name}</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDealTitle}
                      onChange={(e) => setNewDealTitle(e.target.value)}
                      placeholder="e.g. Winter 2026 Teaching Wave"
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-aiesec-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product
                      </label>
                      <select
                        value={newDealProduct}
                        onChange={(e) => setNewDealProduct(e.target.value as any)}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="iGV">iGV</option>
                        <option value="iGTa">iGTa</option>
                        <option value="iGTe">iGTe</option>
                        <option value="CSR_SPONSOR">CSR Sponsor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        MAD Value
                      </label>
                      <input
                        type="number"
                        value={newDealValue}
                        onChange={(e) => setNewDealValue(Number(e.target.value))}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Slots
                      </label>
                      <input
                        type="number"
                        value={newDealSlots}
                        onChange={(e) => setNewDealSlots(Number(e.target.value))}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingDeal(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-aiesec-blue px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                    >
                      Save Deal
                    </button>
                  </div>
                </form>
              )}

              {/* Deal Cards List */}
              <div className="space-y-2">
                {partnerDeals.map((deal) => {
                  const stageConfig = PIPELINE_STAGE_CONFIG[deal.stage];
                  return (
                    <div
                      key={deal.id}
                      className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {deal.title}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${stageConfig?.badgeClass}`}
                        >
                          {stageConfig?.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Value: <strong className="text-slate-800 dark:text-slate-200">{deal.revenueMad.toLocaleString()} MAD</strong> ({deal.expectedHeadcount} slots)
                        </span>
                        <span>Owner: {deal.assignedOwnerName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTS */}
          {activeTab === 'CONTACTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Directory Contacts ({partnerContacts.length})
                </span>
                <button
                  onClick={() => setIsAddingContact(!isAddingContact)}
                  className="flex items-center gap-1 rounded-md bg-aiesec-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600 transition"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Inline Create Contact Form */}
              {isAddingContact && (
                <form
                  onSubmit={handleCreateContact}
                  className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 space-y-3 dark:border-blue-900 dark:bg-blue-950/20"
                >
                  <div className="font-bold text-xs text-aiesec-blue">Add Contact to {partner.name}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={newContactRole}
                        onChange={(e) => setNewContactRole(e.target.value)}
                        placeholder="HR Director, Head of School..."
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingContact(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-aiesec-blue px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              )}

              {/* Contacts List */}
              <div className="space-y-2">
                {partnerContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <span>{c.name}</span>
                        {c.is_primary && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                            Primary POC
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.job_title}</div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DANGER ZONE / ARCHIVING */}
          {activeTab === 'DANGER' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Soft-Archive Partner Organization</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Archiving hides the partner from active sales pipelines without deleting historical touchpoints, contracts, or closed deals.
                </p>

                {partner.isArchived ? (
                  <div className="mt-3 p-2.5 rounded bg-rose-100 text-rose-800 text-xs font-semibold">
                    This organization is already archived ({partner.archivedReason || 'No reason specified'}).
                  </div>
                ) : isArchiving ? (
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mandatory Reason for Archiving *
                    </label>
                    <textarea
                      rows={2}
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                      placeholder="e.g. Bankruptcy, Partner ceased internship operations, Permanent disqualification..."
                      className="w-full rounded border border-rose-300 p-2 text-xs text-slate-900 focus:outline-none dark:border-rose-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsArchiving(false)}
                        className="px-3 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleArchivePartner}
                        disabled={!archiveReason.trim()}
                        className="rounded bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        Confirm Archive
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsArchiving(true)}
                    className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400 transition"
                  >
                    Archive {partner.name}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
