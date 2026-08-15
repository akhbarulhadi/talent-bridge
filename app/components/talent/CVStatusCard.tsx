"use client";

import { useEffect, useState } from "react";
import MaterialIcon from "../ui/MaterialIcon";

interface CVData {
  url: string | null;
  filename: string | null;
  uploadDate: string | null;
  hasCV: boolean;
}

interface Skill {
  id?: string | number;
  name: string; // Sesuaikan dengan nama kolom master skill Anda (misal: skill_name)
}

// Untuk variasi warna badge skill
const COLORS = ["primary", "secondary", "tertiary"];

export default function CVStatusCard() {
  const [cvData, setCvData] = useState<CVData>({
    url: null,
    filename: null,
    uploadDate: null,
    hasCV: false
  });
  
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk menampilkan Modal Preview PDF
  const [showPreview, setShowPreview] = useState(false);

  // Fetch CV status awal dari database
  const fetchCVStatus = async () => {
    try {
      const response = await fetch('/api/cv');
      const rawText = await response.text();
      
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error("Format balasan API /api/cv tidak valid:", rawText);
        throw new Error("Server gagal memberikan format data yang benar.");
      }
      
      if (data.success) {
        setCvData(data.cv);
        if (data.cv.extractedSkills) {
          setExtractedSkills(data.cv.extractedSkills);
        }
      } else {
        setError(data.error || 'Failed to fetch CV status');
      }
    } catch (err: any) {
      console.error('Error fetching CV status:', err);
      setError(err.message || 'Failed to fetch CV status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVStatus();

    // Listen untuk event sukses dari CVUploadModal.tsx
    const handleCVStatusUpdate = (event: any) => {
      const newCvData = event.detail;
      if (newCvData) {
        setCvData({
          hasCV: newCvData.hasCV,
          filename: newCvData.filename,
          uploadDate: newCvData.uploadDate,
          url: newCvData.url || null
        });
        
        if (newCvData.extractedSkills) {
          setExtractedSkills(newCvData.extractedSkills);
        }
      }
    };

    window.addEventListener('cv-status-updated', handleCVStatusUpdate);
    return () => window.removeEventListener('cv-status-updated', handleCVStatusUpdate);
  }, []);

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

  const handleDownloadCV = () => {
    if (cvData.url) {
      window.open(cvData.url, '_blank');
    }
  };

  const triggerUploadModal = () => {
    window.dispatchEvent(new CustomEvent('open-cv-upload'));
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
    <>
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
          </div>

          {cvData.hasCV ? (
            <>
              {/* File Information Box */}
              <div className="mb-6 p-3 bg-surface-variant/20 rounded-lg border border-outline/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="description" className="text-[18px] text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-body)] text-[14px] font-medium text-on-surface truncate">
                      {cvData.filename || 'Your CV Document'}
                    </p>
                    <p className="font-[var(--font-mono)] text-[10px] text-on-surface-variant">
                      PDF Document
                    </p>
                  </div>
                  
                  {/* Actions: Preview & Download */}
                  {cvData.url ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                        title="Preview CV"
                      >
                        <MaterialIcon name="visibility" className="text-[16px]" />
                      </button>
                      <button
                        onClick={handleDownloadCV}
                        className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                        title="Download CV"
                      >
                        <MaterialIcon name="download" className="text-[16px]" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-error italic px-2">URL file tidak ditemukan</span>
                  )}
                </div>
              </div>

              {/* Matched Skills */}
              <div className="mb-6">
                <p className="font-[var(--font-mono)] text-[12px] leading-none tracking-[0.05em] font-bold text-outline mb-3 uppercase">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.length > 0 ? (
                    extractedSkills.map((s: any, index: number) => {
                      const color = COLORS[index % COLORS.length]; 
                      return (
                        <span
                          key={s.id || index}
                          className={`font-[var(--font-mono)] text-[14px] leading-[1.2] tracking-[0.02em] font-medium text-xs bg-${color}/10 text-${color} border border-${color}/20 px-2 py-1 rounded-md`}
                        >
                          {s.skill}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-on-surface-variant italic">
                      Tidak ada skill yang terdeteksi cocok dengan master data.
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
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
          )}

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-error font-[var(--font-body)] text-[12px]">{error}</p>
            </div>
          )}
        </div>

        <div>
          <button 
            onClick={cvData.hasCV && cvData.url ? () => setShowPreview(true) : triggerUploadModal}
            className="w-full py-3 bg-transparent border border-white/20 text-on-surface rounded-lg font-[var(--font-body)] text-[14px] leading-[1.5] hover:bg-white/5 hover:border-white/40 transition-all flex justify-center items-center gap-2"
          >
            {cvData.hasCV ? (
              <>
                Preview CV
                <MaterialIcon name="visibility" size="14px" />
              </>
            ) : (
              <>
                Upload CV
                <MaterialIcon name="upload" size="14px" />
              </>
            )}
          </button>

          {cvData.hasCV && (
            <button 
              onClick={triggerUploadModal} 
              className="mt-3 text-xs text-center text-primary/70 hover:text-primary transition-colors w-full"
            >
              Re-upload CV
            </button>
          )}
        </div>
      </div>

      {/* Modal Preview PDF Overlay */}
      {showPreview && cvData.url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-5xl h-[85vh] bg-surface rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline/20 bg-surface-container">
              <div className="flex items-center gap-3">
                <MaterialIcon name="picture_as_pdf" className="text-primary text-[24px]" />
                <h3 className="font-[var(--font-display)] text-[18px] font-semibold text-on-surface truncate">
                  {cvData.filename || 'CV Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCV}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Download File"
                >
                  <MaterialIcon name="download" className="text-[20px]" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <MaterialIcon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            {/* Iframe PDF Viewer */}
            <div className="flex-1 w-full bg-surface-variant/30 relative">
              {/* Fallback jika iframe loading */}
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              
              <iframe
                src={`${cvData.url}#toolbar=0`}
                title="PDF Preview"
                className="w-full h-full border-none z-10"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}