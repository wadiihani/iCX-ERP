import React from 'react';
import { getMoroccanVisaRegime, type MoroccanVisaRegime } from '@/lib/ir/moroccan-visa-matrix';

interface VisaBadgeProps {
  countryCode: string;
  showTooltip?: boolean;
}

export function VisaBadge({ countryCode, showTooltip = true }: VisaBadgeProps) {
  const info = getMoroccanVisaRegime(countryCode);

  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let label = 'Visa Exempt (90d)';

  if (info.regime === 'AEVM_EVISA') {
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
    label = 'Moroccan eVisa (AEVM)';
  } else if (info.regime === 'CONSULAR_VISA') {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    label = 'Consular Visa (Pack Required)';
  }

  return (
    <div className="inline-flex flex-col space-y-0.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
        title={showTooltip ? info.notes : undefined}
      >
        <span className="mr-1">{info.regime === 'CONSULAR_VISA' ? '⚠️' : '✓'}</span>
        {label}
      </span>
      {info.requiresInvitationPack && (
        <span className="text-[9px] text-amber-600 font-medium">30d lead time required</span>
      )}
    </div>
  );
}
