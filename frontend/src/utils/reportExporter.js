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
 * Triggers browser print-to-PDF with a dedicated printable styled curriculum layout
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
<html>
<head>
  <title>SkillSync Academic Planning Proposal - ${curriculum.title || 'Report'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #1e1b4b;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 5px;
    }
    .badge {
      background: #e0e7ff;
      color: #4338ca;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      display: inline-block;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .card-val {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px;
      font-weight: 700;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .priority-high {
      background: #fee2e2;
      color: #991b1b;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
    }
    .priority-med {
      background: #fef3c7;
      color: #92400e;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { margin: 15mm 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <span class="badge">CURRICULUM INTELLIGENCE OVERHAUL PROPOSAL</span>
      <h1 class="title">${curriculum.title || 'Curriculum Overhaul Proposal'}</h1>
      <div class="subtitle">
        Institution: <strong>${curriculum.institution || 'N/A'}</strong> • Academic Year: <strong>${curriculum.academic_year || '2024-2025'}</strong>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 18px; font-weight: 900; color: #4f46e5;">SkillSync AI</div>
      <div style="font-size: 11px; color: #64748b;">Generated: ${new Date().toLocaleDateString()}</div>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="card">
      <div class="card-label">Curriculum Coverage</div>
      <div class="card-val" style="color: #4f46e5;">${summary.overall_coverage_pct}%</div>
    </div>
    <div class="card">
      <div class="card-label">Critical Gaps</div>
      <div class="card-val" style="color: #dc2626;">${summary.critical_gaps_count}</div>
    </div>
    <div class="card">
      <div class="card-label">Moderate Gaps</div>
      <div class="card-val" style="color: #d97706;">${summary.moderate_gaps_count}</div>
    </div>
    <div class="card">
      <div class="card-label">Industry Benchmark</div>
      <div class="card-val">${summary.total_industry_jobs_analyzed} Live Postings</div>
    </div>
  </div>

  <h2>1. Priority Skill Gaps in Current Curriculum</h2>
  <table>
    <thead>
      <tr>
        <th>Skill / Competency</th>
        <th>Category</th>
        <th>Market Demand</th>
        <th>Curriculum Status</th>
        <th>Gap Priority</th>
      </tr>
    </thead>
    <tbody>
      ${(data.skills || []).slice(0, 14).map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.category}</td>
          <td>${s.market_frequency_pct}%</td>
          <td>${s.is_covered ? '<span style="color:#059669;">Covered</span>' : '<span style="color:#dc2626; font-weight:bold;">Missing</span>'}</td>
          <td>
            ${s.priority === 'HIGH' ? '<span class="priority-high">HIGH GAP</span>' : s.priority === 'MEDIUM' ? '<span class="priority-med">MEDIUM</span>' : '<span style="color:#64748b;">Adequate</span>'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>2. Recommended Curriculum Interventions & Elective Modules</h2>
  <table>
    <thead>
      <tr>
        <th>Target Skill</th>
        <th>Category</th>
        <th>Recommended Action / Course Module</th>
        <th>Impact Gain</th>
      </tr>
    </thead>
    <tbody>
      ${recs.map(r => `
        <tr>
          <td><strong>${r.skill_name}</strong></td>
          <td>${r.category}</td>
          <td>${r.recommended_action}</td>
          <td style="color:#4f46e5; font-weight:bold;">+${r.impact_gain_pct}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>SkillSync Platform &bull; Automated NLP & Taxonomy Intelligence</div>
    <div>CONFIDENTIAL &bull; FOR ACADEMIC PLANNING COUNCIL REVIEW</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
