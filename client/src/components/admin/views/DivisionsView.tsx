import React, { useState } from 'react';
import { Search, Layers, Filter, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import type { AcademicDivisionEntry } from '../../../data/mockData';

interface Props {
  divisions: AcademicDivisionEntry[];
  onOpenAddDivision: () => void;
  onDeleteDivision: (no: number) => void;
}

export const DivisionsView: React.FC<Props> = ({ 
  divisions,
  onOpenAddDivision,
  onDeleteDivision
}) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = divisions.filter((entry) => {
    const matchesDept = selectedDept === 'All' || entry.department === selectedDept;
    const matchesYear = selectedYear === 'All' || entry.year === selectedYear;
    const matchesSearch = 
      entry.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.divisionNames.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesYear && matchesSearch;
  });

  const totalFilteredDivisions = filteredEntries.reduce((acc, curr) => acc + curr.divisionCount, 0);
  const totalAllDivisions = divisions.reduce((acc, curr) => acc + curr.divisionCount, 0);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Academic Divisions Directory</h1>
          <p className="greeting-subtitle">
            Master academic roster &bull; {divisions.length} Course-Year Cohorts &bull; {totalAllDivisions} Central Divisions
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddDivision}>
          <Plus size={16} />
          <span>+ Add Division Cohort</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px', height: '40px' }}
            placeholder="Search by course, department or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Department</label>
          <select 
            className="filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Departments (51 Divisions)</option>
            <option value="Science & Technology">Science &amp; Technology (12)</option>
            <option value="Commerce">Commerce (27)</option>
            <option value="Arts">Arts (6)</option>
            <option value="Management">Management (6)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Academic Year</label>
          <select 
            className="filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All Years (FY, SY, TY)</option>
            <option value="FY">First Year (FY)</option>
            <option value="SY">Second Year (SY)</option>
            <option value="TY">Third Year (TY)</option>
          </select>
        </div>
      </div>

      {/* Summary Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        marginBottom: '16px',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing <strong>{filteredEntries.length}</strong> course-year cohorts (<strong>{totalFilteredDivisions}</strong> total active divisions)
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          background: '#EFF6FF',
          color: '#1D4ED8',
          padding: '3px 10px',
          borderRadius: '12px'
        }}>
          All 51 divisions active
        </span>
      </div>

      {/* Academic Table (Matches exact user specification table) */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>No.</th>
              <th>Department</th>
              <th>Course</th>
              <th style={{ textAlign: 'center' }}>Year</th>
              <th>Divisions</th>
              <th style={{ textAlign: 'center' }}>No. of Divisions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No divisions found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => (
                <tr key={row.no}>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {row.no}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{row.department}</div>
                    <code style={{ fontSize: '11px', color: '#64748B' }}>{row.departmentCode}</code>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: 'var(--student-primary)',
                      background: '#EFF6FF',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {row.course}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: row.year === 'FY' ? '#F0FDF4' : row.year === 'SY' ? '#EFF6FF' : '#FAF5FF',
                      color: row.year === 'FY' ? '#166534' : row.year === 'SY' ? '#1E40AF' : '#6B21A8'
                    }}>
                      {row.year}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {row.divisions.map((div, i) => (
                        <span key={i} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: 'var(--text-main)',
                          border: '1px solid #E2E8F0'
                        }}>
                          {div}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                    {row.divisionCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
