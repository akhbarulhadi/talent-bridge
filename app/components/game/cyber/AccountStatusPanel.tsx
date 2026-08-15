"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { User, Lock, Unlock, ShieldOff } from "lucide-react";
import { INCIDENT_DOSSIER } from "./cyberConfig";
import type { AccountStatus } from "./cyberDerived";

const STATUS_META: Record<
  AccountStatus,
  { label: string; color: string; icon: typeof Lock; session: string }
> = {
  ACTIVE: { label: "ACTIVE", color: "text-error", icon: Unlock, session: "ACTIVE" },
  SUSPICIOUS: {
    label: "SUSPICIOUS",
    color: "text-secondary",
    icon: ShieldOff,
    session: "ACTIVE",
  },
  ISOLATED: { label: "ISOLATED", color: "text-tertiary", icon: Lock, session: "TERMINATED" },
  LOCKED: { label: "LOCKED", color: "text-tertiary", icon: Lock, session: "TERMINATED" },
};

export default function AccountStatusPanel({ status }: { status: AccountStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!badgeRef.current) return;
    gsap.fromTo(
      badgeRef.current,
      { scale: 0.8, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
    );
  }, [status]);

  return (
    <div className="glass-panel rounded-xl p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={15} className="text-primary" />
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.05em] font-bold text-on-surface">
          Account
        </p>
      </div>

      <p className="font-[var(--font-mono)] text-[13px] font-semibold text-on-surface mb-3 truncate">
        {INCIDENT_DOSSIER.accountEmail}
      </p>

      <dl className="space-y-2 text-[12px]">
        <div className="flex items-center justify-between">
          <dt className="font-[var(--font-mono)] uppercase tracking-[0.05em] text-outline-variant">
            Status
          </dt>
          <dd className={`flex items-center gap-1.5 font-[var(--font-mono)] font-bold ${meta.color}`}>
            <span ref={badgeRef} className="flex items-center gap-1.5">
              <Icon size={12} />
              {meta.label}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-[var(--font-mono)] uppercase tracking-[0.05em] text-outline-variant">
            Last Login
          </dt>
          <dd className="font-[var(--font-mono)] text-on-surface">{INCIDENT_DOSSIER.loginTime}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-[var(--font-mono)] uppercase tracking-[0.05em] text-outline-variant">
            Source
          </dt>
          <dd className="font-[var(--font-mono)] text-on-surface">{INCIDENT_DOSSIER.sourceIp}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-[var(--font-mono)] uppercase tracking-[0.05em] text-outline-variant">
            Session
          </dt>
          <dd
            className={`font-[var(--font-mono)] font-bold ${
              meta.session === "ACTIVE" ? "text-error" : "text-outline"
            }`}
          >
            {meta.session}
          </dd>
        </div>
      </dl>
    </div>
  );
}
