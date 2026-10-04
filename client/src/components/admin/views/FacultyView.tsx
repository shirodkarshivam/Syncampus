import React, { useState, useMemo } from 'react';
import { Search, Users, Filter, BookOpen, MapPin, Mail, Award, LayoutGrid, List, UserPlus, Trash2 } from 'lucide-react';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  teachers: TeacherProfile[];
  onOpenAddTeacher: () => void;
  onDeleteTeacher: (id: string) => void;
  onToggleTeacherStatus: (id: string) => void;
  onNavigateToCurriculum?: () => void;
}

export const FacultyView: React.FC<Props> = ({ 
  teachers,
  onOpenAddTeacher,
  onDeleteTeacher,
  onToggleTeacherStatus,
  onNavigateToCurriculum 
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesDept = selectedDept === 'All' || teacher.department === selectedDept;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        teacher.name.toLowerCase().includes(q) ||
        teacher.id.toLowerCase().includes(q) ||
        teacher.department.toLowerCase().includes(q) ||
        teacher.subjects.some(sub => sub.toLowerCase().includes(q));
      return matchesDept && matchesSearch;
    });
  }, [teachers, selectedDept, searchQuery]);

  const deptCounts = useMemo(() => {
    return {
      total: teachers.length,
      sciTech: teachers.filter(t => t.department === 'Science & Technology').length,
      comm: teachers.filter(t => t.department === 'Commerce').length,
      mgmt: teachers.filter(t => t.department === 'Management').length,
      arts: teachers.filter(t => t.department === 'Arts').length,
    };
  }, [teachers]);

  const deptColorMap: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
    'Science & Technology': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', badgeBg: '#DBEAFE' },
    'Commerce': { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', badgeBg: '#D1FAE5' },
    'Management': { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', badgeBg: '#FEF3C7' },
    'Arts': { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF', badgeBg: '#F3E8FF' }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">College Faculty &amp; Teachers Directory</h1>
          <p className="greeting-subtitle">
            Master roster &bull; {teachers.length} Active Teachers &bull; 4 Academic Departments &bull; Course Subject Specializations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onNavigateToCurriculum && (
            <button className="btn-secondary" onClick={onNavigateToCurriculum}>
              <BookOpen size={16} />
              <span>Curriculum</span>
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={onOpenAddTeacher} 
            style={{ background: '#0D9488', borderColor: '#0D9488' }}
          >
            <UserPlus size={16} />
            <span>+ Add Teacher</span>
          </button>
        </div>
      </div>

      {/* KPI Stats by Department */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setSelectedDept('All')}
          style={{
            cursor: 'pointer',
            padding: '16px 20px',
            background: selectedDept === 'All' ? '#F8FAFC' : '#FFFFFF',
            border: selectedDept === 'All' ? '2px solid #2563EB' : '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>All Faculty</span>
            <Users size={16} style={{ color: '#2563EB' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{deptCounts.total}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Across all departments</span>
        </div>

        {[
          { name: 'Science & Technology', code: 'SCI_TECH', count: deptCounts.sciTech, courses: ['BSc IT', 'BSc CS'] },
          { name: 'Commerce', code: 'COMMERCE', count: deptCounts.comm, courses: ['B.Com', 'BFM', 'BBI', 'BMS'] },
          { name: 'Management', code: 'MGMT', count: deptCounts.mgmt, courses: ['BBA'] },
          { name: 'Arts', code: 'ARTS', count: deptCounts.arts, courses: ['BA'] }
        ].map((dept) => {
          const isSelected = selectedDept === dept.name;
          const colors = deptColorMap[dept.name] || { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', badgeBg: '#E2E8F0' };
          return (
            <div 
              key={dept.code}
              onClick={() => setSelectedDept(dept.name)}
              style={{
                cursor: 'pointer',
                padding: '16px 20px',
                background: isSelected ? colors.bg : '#FFFFFF',
                border: isSelected ? `2px solid ${colors.text}` : '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: 'var(--card-shadow)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? colors.text : 'var(--text-muted)' }}>
                  {dept.name}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: colors.badgeBg,
                  color: colors.text
                }}>
                  {dept.code}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: colors.text }}>{dept.count}</div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {dept.courses.join(', ')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '300px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search teacher by name, ID (e.g. T001), or subject (e.g. DBMS, Python)..."
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
              <option value="All">All Departments ({teachers.length})</option>
              <option value="Science & Technology">Science &amp; Technology ({teachers.filter(t => t.department === 'Science & Technology').length})</option>
              <option value="Commerce">Commerce ({teachers.filter(t => t.department === 'Commerce').length})</option>
              <option value="Management">Management ({teachers.filter(t => t.department === 'Management').length})</option>
              <option value="Arts">Arts ({teachers.filter(t => t.department === 'Arts').length})</option>
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'table' ? '#1E293B' : '#64748B',
              boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <List size={14} />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#1E293B' : '#64748B',
              boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Summary Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing <strong>{filteredTeachers.length}</strong> of <strong>{teachers.length}</strong> verified teachers
          {selectedDept !== 'All' && <span> in <strong>{selectedDept}</strong></span>}
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          background: '#EFF6FF',
          color: '#1D4ED8',
          padding: '3px 10px',
          borderRadius: '12px'
        }}>
          100% Faculty Active
        </span>
      </div>

      {/* View Content */}
      {viewMode === 'table' ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Subjects They Can Teach</th>
                <th>Cabin / Room</th>
                <th>Campus Email</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No faculty found matching the query.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const colors = deptColorMap[teacher.department] || { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', badgeBg: '#E2E8F0' };
                  return (
                    <tr key={teacher.id}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #E2E8F0'
                        }}>
                          {teacher.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: colors.bg,
                            color: colors.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                            border: `1px solid ${colors.border}`
                          }}>
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.title}</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ID: {teacher.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}>
                          {teacher.department}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '380px' }}>
                          {teacher.subjects.map((sub, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: '#F8FAFC',
                                color: '#1E293B',
                                border: '1px solid #E2E8F0'
                              }}
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} style={{ color: 'var(--text-dim)' }} />
                          <span>{teacher.room}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} style={{ color: 'var(--text-dim)' }} />
                          <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{teacher.email}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => onToggleTeacherStatus(teacher.id)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            background: teacher.status === 'Active' ? '#F0FDF4' : '#FEF2F2',
                            color: teacher.status === 'Active' ? '#166534' : '#991B1B',
                            border: `1px solid ${teacher.status === 'Active' ? '#BBF7D0' : '#FECACA'}`,
                            cursor: 'pointer'
                          }}
                          title="Click to toggle status"
                        >
                          {teacher.status || 'Active'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="icon-button"
                          title="Remove Teacher"
                          onClick={() => onDeleteTeacher(teacher.id)}
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredTeachers.map((teacher) => {
            const colors = deptColorMap[teacher.department] || { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', badgeBg: '#E2E8F0' };
            return (
              <div key={teacher.id} className="room-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: colors.bg,
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: `1px solid ${colors.border}`
                    }}>
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                        {teacher.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <code style={{ fontSize: '11px', color: '#64748B' }}>{teacher.id}</code>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>&bull;</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: colors.text }}>{teacher.department}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTeacherStatus(teacher.id)}
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: teacher.status === 'Active' ? '#F0FDF4' : '#FEF2F2',
                      color: teacher.status === 'Active' ? '#166534' : '#991B1B',
                      border: `1px solid ${teacher.status === 'Active' ? '#BBF7D0' : '#FECACA'}`,
                      cursor: 'pointer'
                    }}
                  >
                    {teacher.status || 'Active'}
                  </button>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Specialized Subjects
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {teacher.subjects.map((sub, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          color: '#1E293B',
                          border: '1px solid #E2E8F0'
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="room-footer" style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {teacher.room}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {teacher.email.split('@')[0]}
                    </span>
                    <button
                      className="icon-button"
                      title="Remove Teacher"
                      onClick={() => onDeleteTeacher(teacher.id)}
                      style={{ color: '#EF4444', padding: '4px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
