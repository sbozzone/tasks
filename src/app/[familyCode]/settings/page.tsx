"use client";

import { useState } from "react";
import { useFamily } from "@/lib/family-context";
import { Header } from "@/components/layout/Header";
import { Copy, Check, Share2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { family } = useFamily();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${family.share_code}`
      : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${family.name} on DinnerTime`,
          text: `Plan dinners with ${family.name}!`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  function handleLeave() {
    if (confirm("Leave this family? You can rejoin with the code later.")) {
      localStorage.removeItem("familyCode");
      document.cookie = "familyCode=; path=/; max-age=0";
      router.push("/");
    }
  }

  return (
    <>
      <Header title="Settings" familyCode={family.share_code} />

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="bg-card border border-border-light rounded-card p-5">
          <h2 className="font-serif text-lg font-semibold text-text mb-1">
            {family.name}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Share this link so family members can join your meal plan.
          </p>

          <div className="flex items-center gap-2 bg-bg rounded-lg p-3 border border-border">
            <code className="flex-1 text-sm font-mono text-accent truncate">
              {shareUrl}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-card-header transition-colors shrink-0"
              aria-label="Copy link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green" />
              ) : (
                <Copy className="w-4 h-4 text-text-secondary" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="bg-bg rounded-lg px-4 py-2 border border-border text-center flex-1">
              <p className="text-xs text-text-muted mb-0.5">Family Code</p>
              <p className="font-mono font-bold text-lg tracking-wider text-text">
                {family.share_code}
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-card font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share with Family
          </button>
        </div>

        <button
          onClick={handleLeave}
          className="w-full flex items-center justify-center gap-2 py-3 text-red border border-red/20 rounded-card hover:bg-red/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Leave Family
        </button>
      </div>
    </>
  );
}
