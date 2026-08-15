"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import TopNavBar from "@/app/components/ui/TopNavBar";
import SideNavTalent from "@/app/components/ui/SideNavTalent";
import MaterialIcon from "@/app/components/ui/MaterialIcon";
import HRProfileCard from "@/app/components/talent/HRProfileCard";

interface HRProfile {
  id: string;
  email: string;
  job_title: string | null;
  isFollowing: boolean;
  followerCount: number;
}

export default function NetworkPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hrProfiles, setHrProfiles] = useState<HRProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<HRProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "following" | "not-following">("all");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      
      await fetchHRProfiles();
      setLoading(false);
    };

    getUser();
  }, [router, supabase.auth]);

  const fetchHRProfiles = async () => {
    try {
      const response = await fetch("/api/network");
      const data = await response.json();
      
      if (data.success) {
        setHrProfiles(data.hrProfiles);
        setFilteredProfiles(data.hrProfiles);
      } else {
        setError("Failed to fetch HR profiles");
      }
    } catch (err) {
      console.error("Error fetching HR profiles:", err);
      setError("Failed to fetch HR profiles");
    }
  };

  const handleFollowToggle = async (hrId: string, currentlyFollowing: boolean) => {
    try {
      const response = await fetch("/api/network", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hrId: hrId,
          action: currentlyFollowing ? "unfollow" : "follow",
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the local state to reflect the change
        setHrProfiles(prev =>
          prev.map(hr =>
            hr.id === hrId
              ? {
                  ...hr,
                  isFollowing: !currentlyFollowing,
                  followerCount: currentlyFollowing
                    ? hr.followerCount - 1
                    : hr.followerCount + 1,
                }
              : hr
          )
        );
        // Also update filtered profiles
        setFilteredProfiles(prev =>
          prev.map(hr =>
            hr.id === hrId
              ? {
                  ...hr,
                  isFollowing: !currentlyFollowing,
                  followerCount: currentlyFollowing
                    ? hr.followerCount - 1
                    : hr.followerCount + 1,
                }
              : hr
          )
        );
      } else {
        setError(data.error || "Failed to update follow status");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      setError("Failed to update follow status");
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = hrProfiles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hr => 
        hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hr.job_title && hr.job_title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by follow status
    if (filterStatus === "following") {
      filtered = filtered.filter(hr => hr.isFollowing);
    } else if (filterStatus === "not-following") {
      filtered = filtered.filter(hr => !hr.isFollowing);
    }

    setFilteredProfiles(filtered);
  }, [hrProfiles, searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-on-surface-variant">
            Loading network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-[var(--font-body)] overflow-x-hidden">
      {/* TopNavBar */}
      <TopNavBar variant="talent" />

      {/* SideNavBar */}
      <SideNavTalent />

      {/* Main Canvas */}
      <main className="lg:ml-72 mt-20 p-6 md:p-10 max-w-[1440px] mx-auto min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-[32px] leading-[1.2] font-bold text-primary mb-2">
            Professional Network
          </h1>
          <p className="font-[var(--font-body)] text-[16px] leading-[1.5] text-on-surface-variant">
            Connect with HR professionals and expand your professional network
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MaterialIcon name="search" className="text-[20px] text-on-surface-variant" />
              </div>
              <input
                type="text"
                placeholder="Search HR professionals by name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container/50 border border-outline/30 rounded-lg font-[var(--font-body)] text-[14px] text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:bg-surface-container/80 transition-all duration-200"
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "following" | "not-following")}
              className="px-4 py-3 bg-surface-container/50 border border-outline/30 rounded-lg font-[var(--font-body)] text-[14px] text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container/80 transition-all duration-200"
            >
              <option value="all">All HR Professionals</option>
              <option value="following">Following</option>
              <option value="not-following">Not Following</option>
            </select>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <MaterialIcon name="groups" className="text-[18px] text-primary" />
              <span className="font-[var(--font-mono)] text-[14px] text-on-surface">
                <strong>{hrProfiles.length}</strong> Total HR
              </span>
            </div>
            <div className="w-px h-4 bg-outline/30" />
            <div className="flex items-center gap-2">
              <MaterialIcon name="person_add" className="text-[18px] text-secondary" />
              <span className="font-[var(--font-mono)] text-[14px] text-on-surface">
                <strong>{hrProfiles.filter(hr => hr.isFollowing).length}</strong> Following
              </span>
            </div>
            <div className="w-px h-4 bg-outline/30" />
            <div className="flex items-center gap-2">
              <MaterialIcon name="filter_list" className="text-[18px] text-on-surface-variant" />
              <span className="font-[var(--font-mono)] text-[14px] text-on-surface">
                <strong>{filteredProfiles.length}</strong> Showing
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-error font-[var(--font-body)] text-[14px]">{error}</p>
          </div>
        )}

        {/* HR Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-variant flex items-center justify-center">
              {searchTerm || filterStatus !== "all" ? (
                <MaterialIcon name="search_off" className="text-[24px] text-on-surface-variant" />
              ) : (
                <MaterialIcon name="groups" className="text-[24px] text-on-surface-variant" />
              )}
            </div>
            <h3 className="font-[var(--font-display)] text-[20px] font-semibold text-on-surface-variant mb-2">
              {searchTerm || filterStatus !== "all" ? "No Results Found" : "No HR Professionals Found"}
            </h3>
            <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "There are currently no HR professionals available to connect with."}
            </p>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold hover:bg-primary/80 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((hr) => (
              <HRProfileCard
                key={hr.id}
                id={hr.id}
                email={hr.email}
                jobTitle={hr.job_title}
                isFollowing={hr.isFollowing}
                followerCount={hr.followerCount}
                onFollowToggle={handleFollowToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}