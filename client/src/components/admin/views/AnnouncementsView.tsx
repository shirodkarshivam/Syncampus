import React from 'react';
import { Megaphone, Plus, Users, Clock, AlertCircle, Trash2 } from 'lucide-react';
import type { Announcement } from '../../../data/mockData';

interface Props {
  announcements: Announcement[];
  onOpenCreate: () => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AnnouncementsView: React.FC<Props> = ({ 
  announcements, 
  onOpenCreate,
  onDeleteAnnouncement 
}) => {
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Campus Announcements</h1>
          <p className="greeting-subtitle">
            Broadcast targeted communications to specific divisions, departments, or the entire campus.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenCreate}>
          <Plus size={18} />
          <span>+ Add Announcement</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map((ann) => (
          <div key={ann.id} className="content-box-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ann.title}
                  </h3>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} />
                    Audience: <strong>{ann.audience}</strong>
                  </span>
                  <span>&bull;</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {ann.date}
                  </span>
                </div>
              </div>

              {onDeleteAnnouncement && (
                <button 
                  className="icon-button" 
                  title="Delete Announcement"
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {ann.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
