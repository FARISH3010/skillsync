import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2
} from 'lucide-react';

export default function FileUploadModal({ isOpen, onClose, onUploadSuccess, apiBase }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  // 3-step progress feedback
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a PDF, DOCX or TXT syllabus file.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);
    setCurrentStep(1);

    const step2Timer = setTimeout(() => setCurrentStep(2), 1200);
    const step3Timer = setTimeout(() => setCurrentStep(3), 2400);

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());
    if (institution.trim()) formData.append("institution", institution.trim());
    if (academicYear.trim()) formData.append("academic_year", academicYear.trim());

    try {
      const response = await fetch(`${apiBase}/upload/curriculum`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to upload and process document.");
      }

      const data = await response.json();
      setUploadResult(data);
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setInstitution('');
    setAcademicYear('2024-2025');
    setUploadResult(null);
    setError(null);
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border border-rose-200 rounded-2xl shadow-rose-glow overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-[#FFF5F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Ingest Academic Syllabus</h3>
              <p className="text-xs text-stone-500">Upload syllabus document for competency extraction</p>
            </div>
          </div>
          <button 
            onClick={resetForm}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!uploadResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-orange-500 bg-orange-50' 
                    : file 
                    ? 'border-rose-400 bg-[#FFF5F7]' 
                    : 'border-rose-200 hover:border-rose-400 bg-[#FFF5F7]/40'
                }`}
              >
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.txt" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5 border border-rose-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-stone-900 text-xs font-mono">{file.name}</span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Ready to extract
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2 border border-rose-100">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-stone-900">
                      Select or drop syllabus document
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Supports PDF, DOCX or TXT files up to 25MB
                    </p>
                  </div>
                )}
              </div>

              {/* 3-Step Progress */}
              {uploading && (
                <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-rose-200 space-y-2">
                  <span className="text-[11px] uppercase font-bold text-rose-800 block">
                    Extraction Progress:
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      currentStep >= 1 ? 'border-rose-300 bg-rose-100/70 text-rose-800 font-semibold' : 'border-rose-200 text-stone-400'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span className="truncate text-[11px]">1. Parse Document</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      currentStep >= 2 ? 'border-orange-300 bg-orange-100/70 text-orange-900 font-semibold' : 'border-rose-200 text-stone-400'
                    }`}>
                      {currentStep >= 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-orange-600" /> : <span className="w-3.5 h-3.5 shrink-0 text-center">•</span>}
                      <span className="truncate text-[11px]">2. NLP Extraction</span>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      currentStep >= 3 ? 'border-emerald-300 bg-emerald-100/70 text-emerald-900 font-semibold' : 'border-rose-200 text-stone-400'
                    }`}>
                      {currentStep >= 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-emerald-600" /> : <span className="w-3.5 h-3.5 shrink-0 text-center">•</span>}
                      <span className="truncate text-[11px]">3. Gap Telemetry</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Curriculum Title
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CS Curriculum 2024"
                    className="w-full bg-[#FFF5F7] border border-rose-200 rounded-xl px-3 py-2 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Institution / University
                  </label>
                  <input 
                    type="text" 
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Faculty of Technology"
                    className="w-full bg-[#FFF5F7] border border-rose-200 rounded-xl px-3 py-2 text-stone-800 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-ghost text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="btn-primary text-xs cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Upload Success Result View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs">Document Processed Successfully</h4>
                  <p className="text-[11px] text-emerald-800">
                    Extracted <span className="font-bold">{uploadResult.extracted_skills_count} competencies</span> from {uploadResult.title}.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-stone-700 block mb-2 uppercase tracking-wide">
                  Recognized Competency Tags:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {uploadResult.extracted_skills?.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-0.5 rounded-full text-xs bg-[#FFF5F7] border border-rose-200 text-stone-800 font-medium"
                    >
                      {s.skill_name}
                      <span className="text-rose-600 text-[10px] ml-1 font-mono font-semibold">({(s.confidence * 100).toFixed(0)}%)</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-primary text-xs cursor-pointer"
                >
                  Open Dashboard Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

