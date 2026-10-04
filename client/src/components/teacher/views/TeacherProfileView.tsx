import React from 'react';
import { Settings, HelpCircle, LogOut, CheckCircle2 } from 'lucide-react';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  onLogout: () => void;
  email: string;
  teacher?: TeacherProfile;
}

export const TeacherProfileView: React.FC<Props> = ({ onLogout, email, teacher }) => {
  const name = teacher ? teacher.title : 'Prof. Rahul Patil';
  const dept = teacher ? teacher.department : 'Science & Technology';
  const id = teacher ? teacher.id : 'T001';
  const room = teacher ? teacher.room : 'Faculty Wing A-301';
  const status = teacher ? teacher.status : 'Active';
  const subjects = teacher?.subjects && teacher.subjects.length > 0 
    ? teacher.subjects 
    : ['Database Systems', 'DBMS'];
  const displayEmail = teacher?.email || email || 'rahul.patil.t001@campus.edu';

  const initials = teacher
    ? teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RP';

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Faculty Profile</h1>
          <p className="teacher-dept-sub">
            Verified academic identity and system preferences.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Profile Card */}
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#CCFBF1',
              color: '#0F766E',
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
                  background: status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                  color: status === 'Active' ? '#15803D' : '#B45309'
                }}>
                  {status}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Department of {dept} (Faculty ID: {id})
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Employee ID
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {id}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Faculty Cabin / Room
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {room}
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

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Specialized Teaching Subjects ({subjects.length})
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {subjects.map((sub, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    background: '#EFF6FF', 
                    color: '#1D4ED8', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 500,
                    border: '1px solid #DBEAFE'
                  }}
                >
                  {sub}
                </span>
              ))}
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
            onClick={() => alert('Help & Campus Support Documentation')}
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

