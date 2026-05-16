"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "", label: "Plan", icon: CalendarDays },
  { href: "/dishes", label: "Dishes", icon: UtensilsCrossed },
  { href: "/shopping", label: "Shop", icon: ShoppingCart },
];

export function BottomNav({ familyCode }: { familyCode: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const fullPath = `/${familyCode}${tab.href}`;
          const isActive =
            tab.href === ""
              ? pathname === `/${familyCode}`
              : pathname === fullPath;

          return (
            <Link
              key={tab.label}
              href={fullPath}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-touch px-3 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <tab.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
