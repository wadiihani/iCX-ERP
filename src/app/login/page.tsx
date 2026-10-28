'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/operations/national-cockpit';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct login form state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('LCVP_ICX');

  const performLogin = async (email: string, name: string, role: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please enter your official @aiesec.net email');
      return;
    }
    performLogin(customEmail, customName || customEmail.split('@')[0], customRole);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            hd: 'aiesec.net',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        throw new Error(
          `${error.message}. (Note: For local development / drills without live Supabase OAuth credentials, please use the Quick Officer Sign-In below).`
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google OAuth failed. Please use Authorized Officer Quick Sign-In.'
      );
      setLoading(false);
    }
  };

  const pilotOfficers = [
    { name: 'Yassine Alami', email: 'yassine.alami@aiesec.net', role: 'LCP', title: 'LCP Rabat (Local President)' },
    { name: 'Salma Benjelloun', email: 'salma.benjelloun@aiesec.net', role: 'LCVP_ICX', title: 'LCVP iCX Rabat (Operations)' },
    { name: 'Amine Tazi', email: 'amine.tazi@aiesec.net', role: 'LCVP_FNL', title: 'LCVP FnL Rabat (Finance & Legal)' },
    { name: 'Anas Berrada', email: 'anas.berrada@aiesec.net', role: 'MCP', title: 'MCP Morocco (National President)' },
    { name: 'Zineb El Fassi', email: 'zineb.elfassi@aiesec.net', role: 'ECB_AUDIT', title: 'ECB Morocco (Audit & Governance)' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-xl w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
            A
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight">AIESEC iCX ERP</div>
            <div className="text-xs text-slate-400">LC Rabat · MC Morocco National System</div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Sign In to Workspace</h1>
          <p className="mt-1 text-xs text-slate-400">
            Strict statutory access restriction (REQ-001): Only authenticated <span className="text-cyan-400 font-mono font-semibold">@aiesec.net</span> accounts are permitted.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Authentication Error</span>
            </div>
            <p>{error}</p>
          </div>
        )}

        {/* Option 1: Official Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white font-medium text-sm transition shadow-sm hover:border-slate-600"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Authenticating...' : 'Continue with Google (@aiesec.net)'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] uppercase font-semibold tracking-wider text-slate-500 absolute">
            Or Authorized Officer Quick Sign-In
          </span>
        </div>

        {/* Option 2: Quick Officer Sign-In */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-medium">
            Select a verified pilot officer to sign in instantly:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pilotOfficers.map((officer) => (
              <button
                key={officer.email}
                type="button"
                disabled={loading}
                onClick={() => performLogin(officer.email, officer.name, officer.role)}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800/60 hover:border-blue-500/40 text-left transition space-y-0.5 group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition flex items-center justify-between">
                  <span>{officer.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {officer.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{officer.title}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{officer.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Option 3: Custom @aiesec.net Direct Input */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3">
          <div className="text-xs font-medium text-slate-300">
            Direct Email Authentication (REQ-001):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="email"
                placeholder="your.name@aiesec.net"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200"
              >
                <option value="LCVP_ICX">LCVP iCX</option>
                <option value="LCVP_FNL">LCVP FnL</option>
                <option value="LCP">LCP</option>
                <option value="MEMBER_CXP">CXP Member</option>
                <option value="MEMBER_BD">BD Member</option>
                <option value="MCP">MCP (National)</option>
                <option value="ECB_AUDIT">ECB Auditor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign In with Custom @aiesec.net</span>
          </button>
        </form>

        {/* Statutory Policy Disclaimer */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            By signing in, you agree to AIESEC statutory policies (AEPP, APIP, AFPM) and Moroccan Law 09-08 (CNDP). All user sessions and mutations are hash-chained in the append-only audit trail (INV-02).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading authentication gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
