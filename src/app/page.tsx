"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!familyName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/family/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create family");
      localStorage.setItem("familyCode", data.share_code);
      router.push(`/${data.share_code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim();
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Family not found");
      localStorage.setItem("familyCode", data.share_code);
      router.push(`/${data.share_code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (mode === "home") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-light mb-6">
            <UtensilsCrossed className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-text mb-2">
            Family DinnerTime
          </h1>
          <p className="text-text-secondary text-lg">
            Plan your family dinners together
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setMode("create")}
            className="w-full flex items-center justify-between px-6 py-4 bg-accent text-white rounded-card font-semibold text-lg hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            <span>Create a Family</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMode("join")}
            className="w-full flex items-center justify-between px-6 py-4 bg-card border border-border rounded-card font-semibold text-lg text-text hover:bg-card-header active:scale-[0.98] transition-all"
          >
            <span>Join a Family</span>
            <Users className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode("home"); setError(""); }}
            className="text-text-secondary mb-6 text-sm"
          >
            &larr; Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-text mb-2">
            Name your family
          </h2>
          <p className="text-text-secondary mb-6">
            This is how your meal plan will be labeled.
          </p>

          {error && (
            <p className="text-red text-sm mb-4 bg-red/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="e.g. The Bozzones"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full px-4 py-3 bg-card border border-border rounded-card text-lg placeholder:text-text-muted mb-4"
            autoFocus
            maxLength={50}
          />

          <button
            onClick={handleCreate}
            disabled={!familyName.trim() || loading}
            className="w-full px-6 py-4 bg-accent text-white rounded-card font-semibold text-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Family"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm">
        <button
          onClick={() => { setMode("home"); setError(""); }}
          className="text-text-secondary mb-6 text-sm"
        >
          &larr; Back
        </button>

        <h2 className="font-serif text-2xl font-bold text-text mb-2">
          Join your family
        </h2>
        <p className="text-text-secondary mb-6">
          Enter the code shared by a family member.
        </p>

        {error && (
          <p className="text-red text-sm mb-4 bg-red/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Enter family code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          className="w-full px-4 py-3 bg-card border border-border rounded-card text-lg placeholder:text-text-muted mb-4 text-center tracking-widest uppercase"
          autoFocus
          maxLength={12}
        />

        <button
          onClick={handleJoin}
          disabled={!joinCode.trim() || loading}
          className="w-full px-6 py-4 bg-accent text-white rounded-card font-semibold text-lg hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join Family"}
        </button>
      </div>
    </div>
  );
}
