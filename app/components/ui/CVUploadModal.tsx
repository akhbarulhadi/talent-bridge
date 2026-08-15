"use client";

import { useState, useRef, useCallback } from "react";
import MaterialIcon from "./MaterialIcon";

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (cvData: any) => void;
}

interface CVData {
  url: string;
  filename: string;
  uploadDate: string;
  hasCV: boolean;
}

export default function CVUploadModal({ isOpen, onClose, onUploadSuccess }: CVUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state when opened/closed
  const resetModal = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setDragActive(false);
  }, []);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }
    
    setSelectedFile(file);
  };

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  }, [dragActive]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      // PERBAIKAN 1: Ganti 'cv' menjadi 'file' agar sesuai dengan Next.js & Python API
      formData.append('file', selectedFile); 
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      // PERBAIKAN 2: Pastikan mengarah ke /api/upload-cv (bukan /api/cv)
      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // PERBAIKAN 3: Parsing aman untuk mencegah "Unexpected end of JSON"
      const rawText = await response.text();
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Server tidak mengembalikan JSON. Pastikan API route dan server Python berjalan.");
      }
      
      if (response.ok && data.success) {
        setTimeout(() => {
          onUploadSuccess(data.cv || data); // pass data cv yang dikembalikan
          onClose();
          resetModal();
        }, 500);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return 'picture_as_pdf';
    return 'description';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          onClose();
          resetModal();
        }}
      />
      
      {/* Modal */}
      <div className="relative bg-surface-container/90 backdrop-blur-xl border border-outline/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[var(--font-display)] text-[24px] leading-[1.3] font-bold text-primary">
              Upload CV
            </h2>
            <p className="font-[var(--font-body)] text-[14px] text-on-surface-variant mt-1">
              Upload your CV to enhance your profile
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg hover:bg-surface-variant/20 transition-all duration-200"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <div className="flex items-center gap-2">
              <MaterialIcon name="error" className="text-[16px] text-error" />
              <p className="text-error font-[var(--font-body)] text-[14px]">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {!selectedFile && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-outline/40 hover:border-primary/60 hover:bg-surface-variant/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive ? 'bg-primary/20 text-primary' : 'bg-surface-variant/50 text-on-surface-variant'
              }`}>
                <MaterialIcon name="cloud_upload" className="text-[28px]" />
              </div>
              
              <div>
                <p className="font-[var(--font-display)] text-[16px] font-semibold text-on-surface mb-1">
                  {dragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
                </p>
                <p className="font-[var(--font-body)] text-[12px] text-on-surface-variant mb-3">
                  or click to browse files
                </p>
                <p className="font-[var(--font-mono)] text-[10px] text-on-surface-variant">
                  Supports PDF, DOC, DOCX • Max 5MB
                </p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold hover:bg-primary/80 transition-all duration-200 flex items-center gap-2"
              >
                <MaterialIcon name="folder_open" className="text-[16px]" />
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && !isUploading && (
          <div className="border border-outline/30 rounded-xl p-4 bg-surface-variant/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MaterialIcon name={getFileIcon(selectedFile)} className="text-[20px] text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-body)] text-[14px] font-medium text-on-surface truncate">
                  {selectedFile.name}
                </p>
                <p className="font-[var(--font-mono)] text-[12px] text-on-surface-variant">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              
              <button
                onClick={() => setSelectedFile(null)}
                className="text-on-surface-variant hover:text-error p-1 rounded transition-colors duration-200"
              >
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MaterialIcon name={getFileIcon(selectedFile!)} className="text-[20px] text-primary" />
              </div>
              
              <div className="flex-1">
                <p className="font-[var(--font-body)] text-[14px] font-medium text-on-surface">
                  {selectedFile!.name}
                </p>
                <div className="w-full bg-surface-variant/40 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="font-[var(--font-mono)] text-[10px] text-on-surface-variant mt-1">
                  {uploadProgress}% uploaded
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isUploading && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              className="flex-1 py-3 px-4 bg-surface-variant/20 text-on-surface-variant rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold hover:bg-surface-variant/40 transition-all duration-200"
            >
              Cancel
            </button>
            
            <button
              onClick={selectedFile ? handleUpload : () => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-lg font-[var(--font-mono)] text-[12px] uppercase tracking-[0.05em] font-bold hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MaterialIcon name={selectedFile ? "upload" : "add"} className="text-[16px]" />
              {selectedFile ? "Upload CV" : "Select File"}
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}