import React, { useState } from 'react';
import { BookOpen, Search, Filter, Layers, GraduationCap, CheckCircle2 } from 'lucide-react';
import { CURRICULUM_DATA } from '../../../data/curriculumData';
import type { CourseCurriculum } from '../../../data/curriculumData';

interface Props {
  onNavigateToFaculty?: () => void;
}

export const CurriculumView: React.FC<Props> = ({ onNavigateToFaculty }) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCurriculum = CURRICULUM_DATA.filter((course) => {
    const matchesDept = selectedDept === 'All' || course.department === selectedDept;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesDept;

    const matchesCourse = course.course.toLowerCase().includes(q) || course.fullName.toLowerCase().includes(q);
    const matchesSubjects = course.years.some(yr => 
      yr.subjects.some(sub => sub.toLowerCase().includes(q))
    );

    return matchesDept && (matchesCourse || matchesSubjects);
  });

  const deptColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'Science & Technology': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    'Commerce': { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    'Management': { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    'Arts': { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Academic Curriculum &amp; Course Subjects</h1>
          <p className="greeting-subtitle">
            Official Degree Roster &bull; 8 Programs &bull; 24 Cohorts (FY, SY, TY) &bull; 144 Subject Modules
          </p>
        </div>
        {onNavigateToFaculty && (
          <button className="btn-secondary" onClick={onNavigateToFaculty}>
            <GraduationCap size={16} />
            <span>View Faculty Directory</span>
          </button>
        )}
      </div>

      {/* Top Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px', height: '40px' }}
            placeholder="Search subjects (e.g. Java, Taxation, Psychology, Accounting, AI)..."
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
            <option value="All">All Departments (8 Courses)</option>
            <option value="Science & Technology">Science &amp; Technology (2 Courses)</option>
            <option value="Commerce">Commerce (4 Courses)</option>
            <option value="Management">Management (1 Course)</option>
            <option value="Arts">Arts (1 Course)</option>
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
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing <strong>{filteredCurriculum.length}</strong> of <strong>8</strong> courses across 4 departments
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          background: '#F0FDF4',
          color: '#166534',
          padding: '3px 10px',
          borderRadius: '12px'
        }}>
          6 Subjects per Year &bull; 18 per Course
        </span>
      </div>

      {/* Courses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredCurriculum.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: 'var(--text-muted)' }}>
            No courses or subjects found matching your search.
          </div>
        ) : (
          filteredCurriculum.map((course) => {
            const colors = deptColorMap[course.department] || { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' };
            return (
              <div 
                key={course.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--card-shadow)',
                  overflow: 'hidden'
                }}
              >
                {/* Course Header Banner */}
                <div style={{
                  padding: '18px 24px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'var(--text-main)'
                      }}>
                        {course.course}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}>
                        {course.departmentCode}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>&bull;</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {course.department}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500 }}>
                      {course.fullName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE'
                    }}>
                      {course.totalDivisions} Divisions
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      color: 'var(--text-main)',
                      border: '1px solid #E2E8F0'
                    }}>
                      18 Total Subjects
                    </span>
                  </div>
                </div>

                {/* Years Grid (FY, SY, TY) */}
                <div style={{
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {course.years.map((yearData) => {
                    const badgeStyles = yearData.year === 'FY' 
                      ? { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' }
                      : yearData.year === 'SY'
                      ? { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' }
                      : { bg: '#FAF5FF', color: '#6B21A8', border: '#E9D5FF' };

                    return (
                      <div 
                        key={yearData.year}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          padding: '16px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                          paddingBottom: '10px',
                          borderBottom: '1px solid #E2E8F0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: badgeStyles.bg,
                              color: badgeStyles.color,
                              border: `1px solid ${badgeStyles.border}`
                            }}>
                              {yearData.year}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                              {yearData.yearName}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {yearData.subjects.length} Subjects
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {yearData.subjects.map((sub, sIdx) => {
                            const isSearchMatch = searchQuery && sub.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                              <div
                                key={sIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: isSearchMatch ? '#FEF08A' : '#FFFFFF',
                                  border: isSearchMatch ? '1px solid #FACC15' : '1px solid #E2E8F0',
                                  fontSize: '12px',
                                  color: 'var(--text-main)',
                                  fontWeight: isSearchMatch ? 700 : 500
                                }}
                              >
                                <span style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '4px',
                                  background: '#F1F5F9',
                                  color: 'var(--text-dim)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {sIdx + 1}
                                </span>
                                <span style={{ flex: 1 }}>{sub}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
