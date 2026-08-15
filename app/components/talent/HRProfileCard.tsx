"use client";

import { useState } from "react";
import MaterialIcon from "../ui/MaterialIcon";

interface HRProfileCardProps {
  id: string;
  email: string;
  jobTitle: string | null;
  isFollowing: boolean;
  followerCount: number;
  onFollowToggle: (id: string, isCurrentlyFollowing: boolean) => void;
}

export default function HRProfileCard({
  id,
  email,
  jobTitle,
  isFollowing,
  followerCount,
  onFollowToggle,
}: HRProfileCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFollowClick = async () => {
    setIsProcessing(true);
    try {
      await onFollowToggle(id, isFollowing);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate avatar from email
  const getAvatarUrl = (email: string) => {
    const firstLetter = email.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=128`;
  };

  // Extract name from email
  const getDisplayName = (email: string) => {
    const name = email.split("@")[0];
    return name
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <div className="group bg-surface-container/50 backdrop-blur-sm border border-outline/20 rounded-xl p-6 hover:bg-surface-container/70 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative w-20 h-20 rounded-full mb-3 overflow-hidden border-2 border-outline/20 group-hover:border-primary/50 transition-all duration-300">
          <img
            src={getAvatarUrl(email)}
            alt={`${getDisplayName(email)} avatar`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-surface-container flex items-center justify-center">
            <MaterialIcon name="work" className="text-[12px] text-on-primary" />
          </div>
        </div>
        
        <h3 className="font-[var(--font-display)] text-[18px] leading-[1.3] font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors duration-300">
          {getDisplayName(email)}
        </h3>
        
        <p className="font-[var(--font-mono)] text-[12px] leading-[1.2] tracking-[0.02em] text-on-surface-variant mb-2">
          {email}
        </p>

        {jobTitle && (
          <div className="bg-gradient-to-r from-secondary/20 to-primary/20 px-3 py-1 rounded-full mb-3 border border-secondary/30">
            <span className="font-[var(--font-body)] text-[12px] font-medium text-secondary">
              {jobTitle}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 mb-4 py-3 bg-gradient-to-r from-surface-variant/20 to-primary/10 rounded-lg border border-outline/10 group-hover:border-primary/20 transition-all duration-300">
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <MaterialIcon name="group" className="text-[18px] text-primary group-hover:text-primary transition-colors duration-300" />
            <span className="font-[var(--font-mono)] text-[16px] font-bold text-on-surface">
              {followerCount}
            </span>
          </div>
          <p className="font-[var(--font-body)] text-[10px] text-on-surface-variant">
            Followers
          </p>
        </div>
        
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-outline/30 to-transparent" />
        
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <MaterialIcon name="verified" className="text-[18px] text-secondary group-hover:text-secondary transition-colors duration-300" />
            <span className="font-[var(--font-mono)] text-[16px] font-bold text-on-surface">
              HR
            </span>
          </div>
          <p className="font-[var(--font-body)] text-[10px] text-on-surface-variant">
            Verified
          </p>
        </div>
      </div>

      {/* Follow Button */}
      <button
        onClick={handleFollowClick}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold transition-all duration-300 flex items-center justify-center gap-2 transform group-hover:scale-105 ${
          isFollowing
            ? "bg-gradient-to-r from-surface-variant to-surface-variant/80 text-on-surface-variant border border-outline/30 hover:from-error/20 hover:to-error/10 hover:text-error hover:border-error/50 hover:shadow-lg"
            : "bg-gradient-to-r from-primary to-secondary text-on-primary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? (
          <>
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <MaterialIcon
              name={isFollowing ? "person_remove" : "person_add"}
              className="text-[16px]"
            />
            <span>{isFollowing ? "Unfollow" : "Follow"}</span>
          </>
        )}
      </button>

      {/* Connection Status */}
      {isFollowing && (
        <div className="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30 animate-pulse">
          <MaterialIcon name="check_circle" className="text-[14px] text-primary" />
          <span className="font-[var(--font-body)] text-[12px] font-medium text-primary">
            Connected & Following
          </span>
        </div>
      )}
    </div>
  );
}