"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, LogIn, Loader2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  // createBrowserClient stores tokens in COOKIES (not localStorage)
  // so the server-side proxy.ts can read them
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
  );

  useEffect(() => {
    // If already have a valid cookie session, go to dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = redirectTo;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Full page reload — browser now sends the fresh auth COOKIE to proxy
        window.location.href = redirectTo;
      } else {
        setError("No session returned. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "Unexpected error — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Schola</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Admin &amp; Teacher Portal</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700 break-words">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@school.edu"
              className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600/50 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600/50 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
