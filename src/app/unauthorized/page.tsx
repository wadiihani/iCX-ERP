import Link from 'next/link';

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const isDomainRestricted = searchParams?.reason === 'domain_restricted';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Restricted</h1>

        {isDomainRestricted ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 space-y-3 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              Mandatory Statutory Domain Restriction (REQ-001)
            </p>
            <p>
              This enterprise ERP is strictly partitioned for authorized AIESEC personnel. Authentication with personal email providers (Gmail, Outlook, Yahoo) is strictly prohibited by AIESEC data governance standards.
            </p>
            <p className="text-xs text-slate-500">
              Please sign in using your official <code className="font-mono text-blue-600 font-bold">@aiesec.net</code> Google Workspace account.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            You do not possess the required permissions or statutory credentials to access this Local Committee repository.
          </p>
        )}

        <div className="mt-8 flex flex-col space-y-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm"
          >
            Sign in with @aiesec.net
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
