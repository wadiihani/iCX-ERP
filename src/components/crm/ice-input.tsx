'use client';

import React, { useState } from 'react';
import { validateICE } from '@/lib/validation/moroccan-tax';

interface ICEInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  disabled?: boolean;
}

export function ICEInput({ value, onChange, disabled }: ICEInputProps) {
  const [touched, setTouched] = useState(false);
  const result = validateICE(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[\s.-]/g, '');
    if (/^\d{0,15}$/.test(rawVal)) {
      const currentCheck = validateICE(rawVal);
      onChange(rawVal, currentCheck.isValid);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          ICE (Identifiant Commun de l’Entreprise)
          <span className="text-rose-500 ml-1">*</span>
        </label>
        <span className="text-[11px] font-mono text-slate-400">
          {value ? value.replace(/[\s.-]/g, '').length : 0}/15
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder="001 524 316 0000 45"
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-wider border transition-colors bg-white dark:bg-slate-900 ${
            touched && !result.isValid && value.length > 0
              ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
              : result.isValid
              ? 'border-emerald-500 focus:ring-emerald-500'
              : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
          }`}
        />

        {result.isValid && (
          <span className="absolute right-3 top-3 text-emerald-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {touched && !result.isValid && value.length > 0 && (
        <p className="text-xs text-rose-500">{result.error}</p>
      )}
      <p className="text-[11px] text-slate-400">
        Statutory 15-digit identifier required under Moroccan corporate law (REQ-011).
      </p>
    </div>
  );
}
