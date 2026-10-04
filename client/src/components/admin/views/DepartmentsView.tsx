import React from 'react';
import { Layers, BookOpen, GraduationCap, Building2, Plus, Trash2 } from 'lucide-react';
import type { DepartmentSummary } from '../../../data/mockData';

interface Props {
  departments: DepartmentSummary[];
  onOpenAddDepartment: () => void;
  onDeleteDepartment: (id: string) => void;
  onNavigateToDivisions: () => void;
  onNavigateToCurriculum?: () => void;
  onNavigateToFaculty?: () => void;
}

export const DepartmentsView: React.FC<Props> = ({ 
  departments,
  onOpenAddDepartment,
  onDeleteDepartment,
  onNavigateToDivisions,
  onNavigateToCurriculum,
  onNavigateToFaculty
}) => {
  const deptFacultyMap: Record<string, number> = {
    'SCI_TECH': 60,
    'COMMERCE': 40,
    'MGMT': 20,
    'ARTS': 15
  };

  const totalCourses = departments.reduce((acc, d) => acc + d.coursesCount, 0);
  const totalDivisions = departments.reduce((acc, d) => acc + d.divisionsCount, 0);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Academic Departments &amp; Courses</h1>
          <p className="greeting-subtitle">
            Official campus academic structure &bull; {departments.length} Departments &bull; {totalCourses} Degree Programs &bull; {totalDivisions} Divisions
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddDepartment}>
          <Plus size={16} />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div className="filter-bar" style={{ marginBottom: '24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Departments</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{departments.length} Academic Units</div>
          </div>
          <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Degree Courses</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--student-primary)' }}>{totalCourses} Programs</div>
          </div>
          <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Divisions</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0D9488' }}>{totalDivisions} Divisions</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onNavigateToFaculty && (
            <button className="btn-secondary" onClick={onNavigateToFaculty}>
              <GraduationCap size={16} />
              <span>Faculty Directory</span>
            </button>
          )}
          {onNavigateToCurriculum && (
            <button className="btn-secondary" onClick={onNavigateToCurriculum}>
              <BookOpen size={16} />
              <span>Curriculum</span>
            </button>
          )}
          <button className="btn-primary" onClick={onNavigateToDivisions}>
            <Layers size={16} />
            <span>Divisions ({totalDivisions})</span>
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {departments.map((dept) => {
          const facultyCount = deptFacultyMap[dept.code] || 0;
          return (
            <div key={dept.id} className="room-card" style={{ padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {dept.name}
                    </h3>
                    <code style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#F1F5F9',
                      color: '#2563EB',
                      border: '1px solid #E2E8F0'
                    }}>
                      CODE: {dept.code}
                    </code>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: '#F0FDFA',
                      color: '#0D9488',
                      border: '1px solid #99F6E4'
                    }}>
                      {dept.divisionsCount} Divisions
                    </span>
                    {dept.id.startsWith('dept-') && dept.id !== 'dept-sci' && dept.id !== 'dept-comm' && dept.id !== 'dept-arts' && dept.id !== 'dept-mgmt' && (
                      <button
                        className="icon-button"
                        title="Delete Department"
                        onClick={() => onDeleteDepartment(dept.id)}
                        style={{ color: '#EF4444', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {dept.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Offered Courses ({dept.coursesCount})
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {dept.courses.map((course, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE'
                        }}
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="room-footer" style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {onNavigateToFaculty && (
                  <button 
                    className="action-chip" 
                    onClick={onNavigateToFaculty}
                  >
                    Faculty ({facultyCount})
                  </button>
                )}
                {onNavigateToCurriculum && (
                  <button 
                    className="action-chip" 
                    onClick={onNavigateToCurriculum}
                  >
                    Subjects
                  </button>
                )}
                <button 
                  className="action-chip" 
                  onClick={onNavigateToDivisions}
                >
                  Divisions ({dept.divisionsCount}) &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
