"use client";

import { useState, useEffect } from "react";
import MaterialIcon from "./MaterialIcon";
import CVUploadModal from "./CVUploadModal";

interface TopNavBarProps {
  variant?: "talent" | "hr";
}

const talentNavLinks = [
  { label: "Dashboard", href: "/dashboard/talent", active: true },
  { label: "Simulation", href: "/dashboard/talent/simulation" },
];

export default function TopNavBar({ variant = "talent" }: TopNavBarProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navLinks = variant === "talent" ? talentNavLinks : [];

  const handleNavClick = (link: any) => {
    if (link.href !== "#") {
      window.location.href = link.href;
    }
  };

  const handleUploadSuccess = (cvData: any) => {
    console.log('CV uploaded successfully:', cvData);
    // Dispatch event to refresh CV status in other components
    window.dispatchEvent(new CustomEvent('cv-status-updated', { detail: cvData }));
  };

  // Listen for CV upload requests from other components
  useEffect(() => {
    const handleOpenUpload = () => {
      setIsUploadModalOpen(true);
    };

    window.addEventListener('open-cv-upload', handleOpenUpload);
    
    return () => {
      window.removeEventListener('open-cv-upload', handleOpenUpload);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter py-4 h-20 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-8">
        {/* Logo */}
        <span className="font-[var(--font-display)] text-[32px] md:text-[48px] font-bold text-primary tracking-tighter leading-none">
          Talent Bridge
        </span>

        {/* Desktop Navigation Links */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-6 mt-2">
            {navLinks.map((link) =>
              link.active ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-primary font-bold border-b-2 border-primary pb-1 font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] leading-none hover:bg-white/5 transition-all duration-300 active:scale-95"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-on-surface-variant font-medium hover:text-on-surface font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] leading-none hover:bg-white/5 transition-all duration-300 active:scale-95 pb-1"
                >
                  {link.label}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {variant === "talent" && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            <MaterialIcon name="upload" className="text-[18px]" />
            Upload CV
          </button>
        )}
        <button className="text-primary hover:bg-white/5 p-2 rounded-full transition-colors">
          <MaterialIcon name="notifications" />
        </button>
        <button className="text-primary hover:bg-white/5 p-2 rounded-full transition-colors">
          <MaterialIcon name="settings" />
        </button>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden relative">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHtFAAVHXn1HOCTFELdRIN0M0EH6gg0hKcuh9eaU1yyZ8kWGE0so8wMoww0yqTEzhCjWqSKs3f19LM0Gg6Q3B1Z4yMutBvdx_UUfiRLDBDpJSRjK5hVDIg9RhM3em0U3DLlFIwo30UMwY0iuaUw5KSJEBVRSSxNu8p791LIDBC4vlFOgjjjTnZaCN4MLxWcBCZpX96o3Xq09WcJTwdHsv3NmNI3N2cVC7G86CuKd5f28oXPZ1iIIN2OQ"
          />
        </div>
      </div>

      </nav>

      {/* CV Upload Modal */}
      <CVUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
