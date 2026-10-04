import React from 'react';
import { Megaphone, Users, Clock } from 'lucide-react';
import type { Announcement } from '../../../data/mockData';

interface Props {
  announcements: Announcement[];
}

export const StudentAnnouncementsView: React.FC<Props> = ({ announcements }) => {
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Campus Announcements</h1>
          <p className="student-cohort-sub">
            Important notices from Academic Administration, Department Heads, and Faculty.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map((ann) => (
          <div key={ann.id} className="content-box-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {ann.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} />
                    Target: <strong>{ann.audience}</strong>
                  </span>
                  <span>&bull;</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {ann.date}
                  </span>
                </div>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                background: ann.priority === 'Critical' ? '#FEE2E2' : ann.priority === 'Important' ? '#FEF3C7' : '#EFF6FF',
                color: ann.priority === 'Critical' ? '#DC2626' : ann.priority === 'Important' ? '#D97706' : '#2563EB',
              }}>
                {ann.priority}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '10px' }}>
              {ann.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
