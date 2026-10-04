import React, { useState } from 'react';
import { X, Megaphone, Send } from 'lucide-react';
import type { Announcement } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAnnouncement: (announcement: Announcement) => void;
}

export const AddAnnouncementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddAnnouncement
}) => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('BSc IT • Semester 3');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Critical'>('Important');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      audience,
      priority,
      message,
      date: 'Just now'
    };

    onAddAnnouncement(newAnn);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={20} color="#7C3AED" />
            <h3 className="modal-title">Create Announcement</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Announcement Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Semester 3 Internal Examination"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Target Audience</label>
                <select 
                  className="form-control" 
                  value={audience} 
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option value="Entire College">Entire College</option>
                  <option value="Information Technology Dept">Information Technology Dept</option>
                  <option value="BSc IT • Semester 3">BSc IT • Semester 3</option>
                  <option value="BSc IT • Semester 5">BSc IT • Semester 5</option>
                  <option value="BSc CS • Semester 3">BSc CS • Semester 3</option>
                  <option value="All Faculty Members">All Faculty Members</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select 
                  className="form-control" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Critical">Critical (Immediate Push)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Type the announcement message details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div style={{
              background: '#FAF5FF',
              border: '1px solid #DDD6FE',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#6B21A8',
              lineHeight: 1.4
            }}>
              <strong>Auto-Sync Broadcast:</strong> All students and faculty within <strong>{audience}</strong> will receive an instant notification on their dashboard and notification center.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#7C3AED' }}>
              <Send size={15} />
              <span>Publish Announcement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
