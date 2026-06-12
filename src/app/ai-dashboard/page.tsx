"use client";

import React, { useState, useEffect } from "react";
import { supabase, dbGetUserProfile, isSupabaseConfigured } from "../../lib/supabase";

interface NoticeResponse {
  notice: string;
}

export default function AINoticeGenerator() {
  const [input, setInput] = useState<string>("");
  const [generated, setGenerated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  // SECURITY: Always check session — redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        window.location.href = '/login';
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      // Fetch role for display purposes
      const profile = await dbGetUserProfile(session.user.id);
      if (profile) setUserRole(profile.role);
    };
    checkAuth();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setGenerated("");
    if (!input.trim()) {
      setError("Please provide notice details.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to generate notice");
      }
      const data: NoticeResponse = await res.json();
      setGenerated(data.notice);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generated) await navigator.clipboard.writeText(generated);
  };

  // Restrict to admin users
  if (userRole && userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-semibold">Access denied: Admins only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">AI Notice Generator</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter notice details, date, event info, etc."
        rows={6}
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      {error && <p className="text-red-600">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : null}
        Generate Notice
      </button>
      {generated && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Generated Notice</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
            {generated}
          </pre>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
