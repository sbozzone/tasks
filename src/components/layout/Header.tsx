"use client";

import { useFamily } from "@/lib/family-context";
import { Printer, Settings } from "lucide-react";
import Link from "next/link";

export function Header({
  title,
  subtitle,
  showPrint,
  familyCode,
}: {
  title?: string;
  subtitle?: string;
  showPrint?: boolean;
  familyCode: string;
}) {
  const { family } = useFamily();

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-border-light pt-safe">
      <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
        <div>
          <h1 className="font-serif text-xl font-bold text-accent">
            {title || family.name}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showPrint && (
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg text-text-secondary hover:bg-card-header transition-colors min-h-touch min-w-[44px] flex items-center justify-center"
              aria-label="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
          )}
          <Link
            href={`/${familyCode}/settings`}
            className="p-2 rounded-lg text-text-secondary hover:bg-card-header transition-colors min-h-touch min-w-[44px] flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
