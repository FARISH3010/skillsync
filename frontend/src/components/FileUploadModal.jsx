import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Sparkles,
  Building,
  GraduationCap,
  ArrowRight
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

  // 3-step animated progress simulation
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

    // Step simulation timers for tactical feedback
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden glass-panel-glow">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Ingest Academic Syllabus</h3>
              <p className="text-xs text-slate-400">PDF, DOCX or TXT • spaCy Extraction + Gemini AI Pipeline</p>
            </div>
          </div>
          <button 
            onClick={resetForm}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!uploadResult ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Drag and Drop Zone with Emerald Glow Border */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-7 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-lg shadow-emerald-500/20' 
                    : file 
                    ? 'border-emerald-500/60 bg-emerald-500/5' 
                    : 'border-slate-700/80 hover:border-indigo-400/60 bg-slate-850/50'
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
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-slate-100 text-sm font-mono">{file.name}</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Ready for NLP analysis
                    </span>
                    <span className="mt-2 text-[11px] text-emerald-400 font-medium underline">
                      Click or drag another file to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-200 font-display">
                      Drag & Drop Syllabus Document Here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports PDF, DOCX or TXT files up to 25MB
                    </p>
                  </div>
                )}
              </div>

              {/* 3-Step Animated Extraction Pipeline (Visible when uploading) */}
              {uploading && (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono block">
                    Extraction Pipeline Progress:
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                      currentStep >= 1 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 text-slate-500'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">1. Parsing PDF</span>
                    </div>

                    <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                      currentStep >= 2 ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 text-slate-500'
                    }`}>
                      {currentStep >= 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <span className="w-3.5 h-3.5 shrink-0">•</span>}
                      <span className="truncate">2. AI Extraction</span>
                    </div>

                    <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                      currentStep >= 3 ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-slate-800 text-slate-500'
                    }`}>
                      {currentStep >= 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <span className="w-3.5 h-3.5 shrink-0">•</span>}
                      <span className="truncate">3. Gap Telemetry</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Curriculum Title
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Institution / University
                  </label>
                  <input 
                    type="text" 
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford / IIT / Anna University"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition ${
                    uploading || !file 
                      ? 'bg-indigo-600/50 cursor-not-allowed opacity-60' 
                      : 'shimmer-button shadow-indigo-500/25'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ingesting & Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Parse & Generate Gap Report
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Upload Success Result View */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm font-display">Document Ingestion Successful!</h4>
                  <p className="text-xs text-slate-300">
                    Extracted <span className="font-bold text-emerald-400">{uploadResult.extracted_skills_count} industry competencies</span> from {uploadResult.title}.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                  Recognized Competency Tags:
                </span>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {uploadResult.extracted_skills?.map((s, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {s.skill_name}
                      <span className="text-[10px] text-slate-400 font-mono">({(s.confidence * 100).toFixed(0)}%)</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition"
                >
                  View Active Dashboard Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
