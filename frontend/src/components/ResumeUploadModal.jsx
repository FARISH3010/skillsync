import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  Briefcase,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

import { getResourcesForCourse } from '../utils/courseResources';

export default function ResumeUploadModal({ 
  isOpen, 
  onClose, 
  jobsData = [], 
  curriculumId = 'curr_cs_2024',
  apiBase = 'http://localhost:8000' 
}) {
  const [file, setFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF or DOCX resume to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (selectedJobId) {
      formData.append("target_job_id", selectedJobId);
    }
    if (curriculumId) {
      formData.append("curriculum_id", curriculumId);
    }

    try {
      const response = await fetch(`${apiBase}/resume/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to analyze resume.");
      }

      const result = await response.json();
      setAnalysisResult(result.analysis);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during resume analysis.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
    setSelectedJobId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-[#FFF5F7] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-['Hanken_Grotesk'] flex items-center gap-2">
                Resume Intelligence &amp; Job Fit Diagnostic
              </h2>
              <p className="text-xs text-stone-500">
                AI evaluation of candidate suitability, matching jobs, missing gaps, and bridging courses.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-50 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!analysisResult ? (
            /* Upload & Config Screen */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Job Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Target Job Position <span className="text-stone-400 font-normal lowercase">(optional — evaluates against this role)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-[#FFF5F7] border border-rose-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-rose-400 font-medium cursor-pointer"
                  >
                    <option value="">-- Let AI Recommend Best Matched Roles Across Market --</option>
                    {jobsData.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company} ({j.experience})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  dragActive 
                    ? 'border-rose-500 bg-rose-50/60 ring-4 ring-rose-500/10' 
                    : file 
                      ? 'border-emerald-400 bg-emerald-50/30' 
                      : 'border-rose-200 bg-[#FFF9FA] hover:bg-rose-50/40'
                }`}
                onClick={() => document.getElementById('resume-file-input').click()}
              >
                <input 
                  id="resume-file-input"
                  type="file" 
                  accept=".pdf,.docx,.doc" 
                  onChange={handleFileChange}
                  className="hidden" 
                />

                {file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-stone-900 block">{file.name}</span>
                      <span className="text-xs text-stone-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB • Ready for Diagnostic
                      </span>
                    </div>
                    <span className="text-xs text-rose-600 font-semibold underline mt-1">
                      Change File
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs mb-1">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-stone-900">
                      Drag &amp; Drop Candidate Resume Here
                    </span>
                    <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                      Supports PDF and Word DOCX documents. Extract candidate capabilities, check job suitability, and calculate missing competencies.
                    </p>
                    <span className="px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-700 shadow-xs mt-2">
                      Browse Local Files
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs px-4 py-2"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="btn-primary text-xs px-6 py-2 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing &amp; Benchmarking Resume...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Analyze Resume &amp; Map Courses</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Analysis Results Screen */
            <div className="space-y-6">
              
              {/* Executive Resume Card */}
              <div className="bg-gradient-to-r from-white via-[#FFF7F9] to-white border border-rose-200 rounded-2xl p-5 shadow-pink-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                        Resume Assessment
                      </span>
                      <span className="text-xs text-stone-500 font-mono">Candidate: {analysisResult.candidate_name || 'Applicant'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-950 font-['Hanken_Grotesk']">
                      Overall Match Quality: <span className="text-rose-600">{analysisResult.resume_overall_rating}</span>
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-white border border-rose-200 px-4 py-3 rounded-2xl shadow-xs shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Readiness</span>
                      <span className="text-2xl font-black text-rose-600 font-mono">
                        {analysisResult.resume_score_pct}%
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-3 border-rose-100 border-t-rose-600 flex items-center justify-center font-bold text-xs font-mono text-stone-800">
                      {analysisResult.resume_score_pct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Job Suitability Card (if available) */}
              {analysisResult.target_job_analysis && (
                <div className={`p-5 rounded-2xl border ${
                  analysisResult.target_job_analysis.is_suitable 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-amber-50/40 border-amber-200'
                } shadow-xs space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-rose-600" />
                      <h4 className="text-sm font-bold text-stone-900">
                        Target Role: {analysisResult.target_job_analysis.job_title} ({analysisResult.target_job_analysis.company})
                      </h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      analysisResult.target_job_analysis.is_suitable 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {analysisResult.target_job_analysis.suitability_verdict} ({analysisResult.target_job_analysis.suitability_score_pct}% Fit)
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    {analysisResult.target_job_analysis.fit_explanation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matching Core Competencies
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(analysisResult.target_job_analysis.matching_skills || []).length > 0 ? (
                          analysisResult.target_job_analysis.matching_skills.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-400 italic">No direct keyword overlap</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                      <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing / Lacking Competencies
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(analysisResult.target_job_analysis.missing_skills || []).length > 0 ? (
                          analysisResult.target_job_analysis.missing_skills.map((s, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">All prerequisite competencies verified!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Lacks Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Key Strengths Demonstrated
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {(analysisResult.strengths || []).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specific Lacks */}
                <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Specific Lacks &amp; Shortcomings
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {(analysisResult.lacks || []).map((lack, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{lack}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Applicable Jobs Candidate Can Apply For */}
              <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                    <h4 className="text-sm font-bold text-stone-900">
                      All Roles You Can Apply For With This Resume
                    </h4>
                  </div>
                  <span className="badge-info text-xs">
                    {(analysisResult.applicable_jobs || []).length} Jobs Matched
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {(analysisResult.applicable_jobs || []).map((job, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-white border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-stone-900">{job.title}</h5>
                          <span className="text-[11px] text-stone-500">at {job.company}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5">{job.match_reasons}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-rose-700">
                          {job.match_pct}% Match
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          job.match_pct >= 70 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {job.match_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Courses to Overcome Lacks */}
              <div className="bg-white border-2 border-rose-200 rounded-2xl p-5 shadow-rose-glow space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-rose-600" />
                    <h4 className="text-sm font-bold text-stone-900">
                      Recommended Curriculum Courses to Overcome Lacks
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                    Curriculum Alignment Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysisResult.recommended_courses || []).map((course, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-gradient-to-b from-[#FFF5F7] to-white border border-rose-200 flex flex-col justify-between gap-2 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-rose-200 text-rose-700">
                            {course.course_code}
                          </span>
                          <h5 className="text-xs font-bold text-stone-900">{course.course_name}</h5>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed mt-1">
                          {course.why_recommended}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-rose-100">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                          Skills Addressed:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(course.skills_addressed || []).map((sk, sIdx) => (
                            <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-rose-200 text-stone-700 font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Course Learning Resources */}
                      {(() => {
                        const resources = getResourcesForCourse(course.course_name, course.why_recommended, course.skills_addressed);
                        if (!resources || resources.length === 0) return null;
                        return (
                          <div className="pt-2.5 mt-1 border-t border-rose-100">
                            <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                              <BookOpen className="w-3 h-3 text-rose-600" />
                              Learning Resources:
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {resources.map((r, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white border border-rose-100 hover:border-rose-400 hover:shadow-xs transition-all text-stone-700 hover:text-rose-700"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <ExternalLink className="w-3 h-3 shrink-0 text-stone-400 group-hover:text-rose-600 transition-colors" />
                                    <span className="truncate font-medium text-[11px]">{r.title}</span>
                                  </div>
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                    {r.provider}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset / Done Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
                <button
                  onClick={handleReset}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Analyze Another Resume
                </button>
                <button
                  onClick={onClose}
                  className="btn-primary text-xs px-6 py-2"
                >
                  Done
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
