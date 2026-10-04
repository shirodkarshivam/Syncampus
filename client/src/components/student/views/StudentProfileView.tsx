import React from 'react';
import { Settings, HelpCircle, LogOut, User } from 'lucide-react';
import type { Student } from '../../../data/studentsData';

interface Props {
  onLogout: () => void;
  email: string;
  student?: Student;
  subjects?: string[];
  assignedTeachers?: { subject: string; teacherName: string; teacherId: string }[];
}

export const StudentProfileView: React.FC<Props> = ({ 
  onLogout, 
  email,
  student,
  subjects = [],
  assignedTeachers = []
}) => {
  const name = student?.name || 'Yash Pawar';
  const id = student?.id || 'STU0001';
  const dept = student?.department || 'Science & Technology';
  const course = student?.course || 'BSc IT';
  const year = student?.year || 'FY';
  const division = student?.division || 'A';
  const classroom = student?.classroom || 'Room 101';
  const batch = student?.batch || 'A';
  const displayEmail = student?.email || email || 'stu0001@sonopantcollege.edu.in';

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Student Profile</h1>
          <p className="student-cohort-sub">
            Enrolled student credentials, division allocations, and academic faculty assignments.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#DBEAFE',
              color: '#1D4ED8',
              fontSize: '22px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {name}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#DCFCE7',
                  color: '#15803D'
                }}>
                  ● Enrolled
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Department of {dept}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Student ID / Roll No.
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {id}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Course &amp; Cohort
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {course} &bull; {year} (Div {division})
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Assigned Classroom
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {classroom}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Practical Batch
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                Batch {batch}
              </div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Registered Campus Email
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>
              {displayEmail}
            </div>
          </div>

          {/* Enrolled Subjects & Assigned Faculty */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Enrolled Course Subjects &amp; Assigned Faculty ({subjects.length || assignedTeachers.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {assignedTeachers.length > 0 ? (
                assignedTeachers.map((at, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
                      {at.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} />
                      <span>{at.teacherName} ({at.teacherId})</span>
                    </div>
                  </div>
                ))
              ) : (
                subjects.map((sub, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-main)'
                    }}
                  >
                    {sub}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="content-box-card" style={{ padding: '10px 16px' }}>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px' }}
            onClick={() => alert('Account Settings & Security')}
          >
            <Settings size={18} />
            <span>Account Settings</span>
          </button>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px' }}
            onClick={() => alert('Help & Student Guide')}
          >
            <HelpCircle size={18} />
            <span>Help &amp; Support</span>
          </button>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px', color: '#DC2626' }}
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
