/**
 * Generates and downloads a clean, formatted CSV report of curriculum skill gaps,
 * market demand metrics, and recommended interventions.
 */
export function exportReportToCSV(data) {
  if (!data || !data.skills) return;

  const curriculum = data.curriculum || {};
  const summary = data.summary || {};

  const headers = [
    "Skill ID",
    "Skill Name",
    "Category",
    "Market Frequency (%)",
    "Demand Score",
    "Curriculum Status",
    "Gap Score",
    "Priority Level",
    "Recommended Intervention Module"
  ];

  const rows = data.skills.map(s => [
    `"${s.skill_id}"`,
    `"${s.name}"`,
    `"${s.category}"`,
    s.market_frequency_pct,
    s.demand_score,
    s.is_covered ? "COVERED" : "MISSING",
    s.gap_score,
    s.priority,
    `"${s.recommended_module || ''}"`
  ]);

  const metaRows = [
    ["SKILLSYNC CURRICULUM INTELLIGENCE REPORT"],
    [`Curriculum Title`, `"${curriculum.title || 'N/A'}"`],
    [`Institution`, `"${curriculum.institution || 'N/A'}"`],
    [`Academic Year`, `"${curriculum.academic_year || 'N/A'}"`],
    [`Export Date`, `"${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}"`],
    [`Overall Coverage Score`, `${summary.overall_coverage_pct}%`],
    [`Critical Gaps Count`, `${summary.critical_gaps_count}`],
    [`Moderate Gaps Count`, `${summary.moderate_gaps_count}`],
    [`Total Skills Tracked`, `${summary.total_skills_tracked}`],
    [`Total Industry Postings Analyzed`, `${summary.total_industry_jobs_analyzed}`],
    []
  ];

  const csvContent = 
    metaRows.map(r => r.join(",")).join("\n") + "\n" +
    headers.join(",") + "\n" +
    rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SkillSync_Curriculum_Report_${curriculum.id || 'export'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser print-to-PDF with a modern Pink & Orange Bento printable layout
 */
export function exportReportToPDF(data) {
  if (!data) return;

  const curriculum = data.curriculum || {};
  const summary = data.summary || {};
  const criticalGaps = data.skills ? data.skills.filter(s => s.priority === "HIGH") : [];
  const recs = data.recommendations || [];

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow pop-ups to generate PDF report.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>SkillSync Curriculum Intelligence Report - ${curriculum.title || 'Executive Dossier'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 12mm 15mm;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1c1917;
      background: #FFFFFF;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-banner {
      border: 1px solid #fcd0db;
      border-radius: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #ffffff 0%, #fff5f7 50%, #ffffff 100%);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(244, 63, 94, 0.06);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0c0a09;
      letter-spacing: -0.02em;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-title span {
      color: #e11d48;
    }
    .badge-pro {
      background: #ffe4e6;
      color: #be123c;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #fecdd3;
    }
    .doc-meta {
      font-size: 11px;
      color: #78716c;
      margin-top: 4px;
    }
    .tag-ribbon {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #ea580c;
      background: #ffedd5;
      border: 1px solid #fed7aa;
      padding: 3px 8px;
      border-radius: 9999px;
      margin-bottom: 6px;
    }
    .h1-title {
      font-family: 'Newsreader', serif;
      font-size: 24px;
      font-weight: 600;
      color: #0c0a09;
      margin: 4px 0 6px 0;
      line-height: 1.25;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .bento-card {
      background: #ffffff;
      border: 1px solid #fcd0db;
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 1px 4px rgba(244, 114, 182, 0.06);
    }
    .bento-label {
      font-size: 10px;
      font-weight: 700;
      color: #881337;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .bento-val {
      font-size: 26px;
      font-weight: 800;
      color: #0c0a09;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
      font-family: 'Hanken Grotesk', sans-serif;
    }
    .bento-val.rose { color: #e11d48; }
    .bento-val.orange { color: #ea580c; }
    .bento-val.emerald { color: #059669; }
    .bento-desc {
      font-size: 10px;
      color: #78716c;
      margin-top: 4px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0c0a09;
      margin-top: 24px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: #e11d48;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      border: 1px solid #fcd0db;
      border-radius: 12px;
      overflow: hidden;
      font-size: 12px;
    }
    th {
      background: #fff5f7;
      text-align: left;
      padding: 10px 14px;
      font-weight: 700;
      color: #881337;
      border-bottom: 1px solid #fcd0db;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid #fce7f3;
      color: #1c1917;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:nth-child(even) td {
      background: #fffbfd;
    }
    .badge-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      display: inline-block;
    }
    .badge-critical {
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
    }
    .badge-covered {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-warning {
      background: #ffedd5;
      color: #9a3412;
      border: 1px solid #fed7aa;
    }
    .badge-lift {
      background: #fff0f3;
      color: #e11d48;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      border: 1px solid #fcd0db;
    }
    .footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #fcd0db;
      font-size: 11px;
      color: #78716c;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <div class="brand-title">Skill<span>Sync</span> <span class="badge-pro">PRO</span></div>
      <div class="doc-meta">
        Executive Telemetry Dossier &bull; Institution: <strong>${curriculum.institution || 'Academic Council'}</strong>
      </div>
      <div class="doc-meta">
        Curriculum: <strong>${curriculum.title || 'Academic Plan'}</strong> (${curriculum.academic_year || '2024-2025'})
      </div>
    </div>
    <div style="text-align: right;">
      <span class="tag-ribbon">Labor Alignment Audit</span>
      <div style="font-size: 11px; color: #78716c; font-family: 'JetBrains Mono', monospace;">
        Generated: ${new Date().toLocaleDateString()}
      </div>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="bento-card">
      <div class="bento-label">Curriculum Fit</div>
      <div class="bento-val rose">${summary.overall_coverage_pct}%</div>
      <div class="bento-desc">Baseline vs Market</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Critical Gaps</div>
      <div class="bento-val orange">${summary.critical_gaps_count}</div>
      <div class="bento-desc">&ge;60% employer frequency</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Tracked Roles</div>
      <div class="bento-val">${summary.total_industry_jobs_analyzed}</div>
      <div class="bento-desc">Verified postings benchmark</div>
    </div>
    <div class="bento-card">
      <div class="bento-label">Total Skills Tracked</div>
      <div class="bento-val emerald">${summary.total_skills_tracked}</div>
      <div class="bento-desc">Cross-referenced competencies</div>
    </div>
  </div>

  <div class="section-title">
    <span class="section-dot"></span>
    <span>1. Priority Curricular Skill Gaps & Alignment Matrix</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Skill / Competency</th>
        <th>Category</th>
        <th>Market Demand</th>
        <th>Curriculum Status</th>
        <th>Action Priority</th>
      </tr>
    </thead>
    <tbody>
      ${(data.skills || []).slice(0, 15).map(s => `
        <tr>
          <td>
            <strong>${s.name}</strong>
            <div style="font-size: 10px; color: #78716c;">${s.recommended_module || 'Standard Module'}</div>
          </td>
          <td><span style="font-size: 11px; color: #78716c;">${s.category}</span></td>
          <td><strong style="font-family: 'JetBrains Mono', monospace;">${s.market_frequency_pct}%</strong></td>
          <td>
            ${s.is_covered 
              ? '<span class="badge-pill badge-covered">Covered</span>' 
              : '<span class="badge-pill badge-critical">Missing Gap</span>'
            }
          </td>
          <td>
            ${s.priority === 'HIGH' 
              ? '<span class="badge-pill badge-critical">HIGH PRIORITY</span>' 
              : s.priority === 'MEDIUM' 
              ? '<span class="badge-pill badge-warning">MEDIUM</span>' 
              : '<span class="badge-pill" style="background:#f5f5f4; color:#78716c;">ADEQUATE</span>'
            }
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">
    <span class="section-dot" style="background:#ea580c;"></span>
    <span>2. Algorithmic Interventions & Recommended Course Modules</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Target Skill</th>
        <th>Category</th>
        <th>Recommended Action / Course Intervention</th>
        <th>Priority</th>
        <th>Projected Lift</th>
      </tr>
    </thead>
    <tbody>
      ${recs.map(r => `
        <tr>
          <td><strong>${r.skill_name}</strong></td>
          <td><span style="font-size: 11px; color: #78716c;">${r.category}</span></td>
          <td>${r.recommended_action}</td>
          <td>
            <span class="badge-pill ${r.priority === 'HIGH' ? 'badge-critical' : 'badge-warning'}">
              ${r.priority}
            </span>
          </td>
          <td><span class="badge-pill badge-lift">+${r.impact_gain_pct}% Lift</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div><strong>SkillSync Curriculum Intelligence Engine</strong> &bull; Autonomous Curriculum Harmonization</div>
    <div style="font-family: 'JetBrains Mono', monospace;">CONFIDENTIAL &bull; FOR ACADEMIC SENATE REVIEW</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
