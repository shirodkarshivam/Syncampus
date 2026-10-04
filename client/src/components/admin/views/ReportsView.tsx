import React from 'react';
import { Download, FileSpreadsheet, BarChart3, Users, DoorOpen, CalendarCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const reportCategories = [
    { title: 'Student Enrollment Breakdown', desc: 'Active students grouped by Department, Semester, and Division.', icon: <Users size={20} color="#2563EB" /> },
    { title: 'Classroom Utilization & Occupancy', desc: 'Seat capacity vs daily lecture allocation hours.', icon: <DoorOpen size={20} color="#0D9488" /> },
    { title: 'Faculty Workload & Timetable Audit', desc: 'Weekly teaching hours and lecture assignments.', icon: <CalendarCheck size={20} color="#7C3AED" /> },
    { title: 'Timetable Exceptions & Cancellations', desc: 'Rescheduled and cancelled lecture statistics for term review.', icon: <BarChart3 size={20} color="#D97706" /> }
  ];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Campus Reports &amp; Analytics</h1>
          <p className="greeting-subtitle">
            Export comprehensive administrative logs and academic performance summaries.
          </p>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <div className="filter-group">
          <label className="filter-label">Academic Term</label>
          <select className="filter-select">
            <option>Academic Term 2026-2027 (Odd Sem)</option>
            <option>Academic Term 2025-2026 (Even Sem)</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Format</label>
          <select className="filter-select">
            <option>Excel Spreadsheet (.xlsx)</option>
            <option>PDF Document (.pdf)</option>
            <option>CSV Format (.csv)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {reportCategories.map((rep, idx) => (
          <div key={idx} className="room-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {rep.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{rep.title}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                {rep.desc}
              </p>
            </div>
            <div className="room-footer">
              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px 14px' }}
                onClick={() => alert(`Exporting: ${rep.title}`)}
              >
                <Download size={14} />
                <span>Generate &amp; Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
