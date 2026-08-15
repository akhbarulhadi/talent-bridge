"use client";

import { useEffect, useState } from "react";
import MaterialIcon from "../ui/MaterialIcon";

const extractedSkills = [
  { name: "Next.js", color: "primary" },
  { name: "Python", color: "secondary" },
  { name: "AWS", color: "tertiary" },
  { name: "Docker", color: "primary" },
  { name: "React", color: "primary" },
];

interface CVData {
  url: string | null;
  filename: string | null;
  uploadDate: string | null;
  hasCV: boolean;
}

export default function CVStatusCard() {
  const [cvData, setCvData] = useState<CVData>({
    url: null,
    filename: null,
    uploadDate: null,
    hasCV: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CV status
  const fetchCVStatus = async () => {
    try {
      const response = await fetch('/api/cv');
      const data = await response.json();
      
      if (data.success) {
        setCvData(data.cv);
      } else {
        setError('Failed to fetch CV status');
      }
    } catch (err) {
      console.error('Error fetching CV status:', err);
      setError('Failed to fetch CV status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVStatus();

    // Listen for CV status updates
    const handleCVStatusUpdate = (event: any) => {
      setCvData(event.detail);
    };

    window.addEventListener('cv-status-updated', handleCVStatusUpdate);
    
    return () => {
      window.removeEventListener('cv-status-updated', handleCVStatusUpdate);
    };
  }, []);

  // Format upload date
  const formatUploadDate = (dateString: string | null) => {
    if (!dateString) return 'Not uploaded';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Get CV score based on status
  const getCVScore = () => {
    if (!cvData.hasCV) return 0;
    return 92; // This could be calculated based on CV analysis in the future
  };

  // Handle CV download
  const handleDownloadCV = () => {
    if (cvData.url) {
      window.open(cvData.url, '_blank');
    }
  };
  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-8 flex flex-col justify-between animate-stagger stagger-delay-1">
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="font-[var(--font-mono)] text-[12px] text-on-surface-variant">
              Loading CV status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-8 flex flex-col justify-between animate-stagger stagger-delay-1">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-outline uppercase tracking-wider mb-1">
              CV Status
            </p>
            <div className="flex items-center gap-2">
              <h3 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-semibold text-tertiary">
                {cvData.hasCV ? 'Active' : 'Not Uploaded'}
              </h3>
              {cvData.hasCV && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            {cvData.uploadDate && (
              <p className="font-[var(--font-mono)] text-[10px] text-on-surface-variant mt-1">
                Uploaded {formatUploadDate(cvData.uploadDate)}
              </p>
            )}
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5 text-center min-w-[80px]">
            <p className="font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-2xl font-bold text-on-surface">
              {getCVScore()}
              <span className="text-sm text-outline-variant">/100</span>
            </p>
            <p className="font-[var(--font-mono)] text-[10px] leading-none tracking-[0.05em] font-bold text-outline-variant mt-1 uppercase">
              Score
            </p>
          </div>
        </div>

        {cvData.hasCV ? (
          <>
            {/* CV File Info */}
            <div className="mb-6 p-3 bg-surface-variant/20 rounded-lg border border-outline/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="description" className="text-[18px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-body)] text-[14px] font-medium text-on-surface truncate">
                    {cvData.filename}
                  </p>
                  <p className="font-[var(--font-mono)] text-[10px] text-on-surface-variant">
                    PDF Document
                  </p>
                </div>
                <button
                  onClick={handleDownloadCV}
                  className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                  title="Download CV"
                >
                  <MaterialIcon name="download" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="mb-6">
              <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-outline mb-3 uppercase">
                Extracted Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs bg-${skill.color}/10 text-${skill.color} border border-${skill.color}/20 px-2 py-1 rounded-md`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* No CV Uploaded State */}
            <div className="mb-6 text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-variant/20 flex items-center justify-center">
                <MaterialIcon name="upload_file" className="text-[24px] text-on-surface-variant" />
              </div>
              <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant mb-2">
                No CV uploaded yet
              </p>
              <p className="font-[var(--font-mono)] text-[12px] text-on-surface-variant">
                Upload your CV to get skill analysis and improve your profile score
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-error font-[var(--font-body)] text-[12px]">{error}</p>
          </div>
        )}
      </div>

      <button 
        onClick={cvData.hasCV ? handleDownloadCV : () => window.dispatchEvent(new CustomEvent('open-cv-upload'))}
        className="w-full py-3 bg-transparent border border-white/20 text-on-surface rounded-lg font-[var(--font-body)] text-[14px] leading-[1.5] hover:bg-white/5 hover:border-white/40 transition-all flex justify-center items-center gap-2"
      >
        {cvData.hasCV ? (
          <>
            View Details
            <MaterialIcon name="arrow_forward" size="14px" />
          </>
        ) : (
          <>
            Upload CV
            <MaterialIcon name="upload" size="14px" />
          </>
        )}
      </button>
    </div>
  );
}
