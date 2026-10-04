import React, { useState } from 'react';
import { X, DoorOpen, CheckCircle, Bell } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import { INITIAL_CLASSROOMS } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmChangeRoom: (id: string, newRoom: string) => void;
}

export const TeacherChangeRoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmChangeRoom
}) => {
  const [newRoom, setNewRoom] = useState('Room 305');

  if (!isOpen || !lecture) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmChangeRoom(lecture.id, newRoom);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DoorOpen size={20} color="#0D9488" />
            <h3 className="modal-title">Change Classroom</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                {lecture.subject}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {lecture.time} &bull; {lecture.course} Sem {lecture.semester} Div {lecture.division}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Room</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                  {lecture.room}
                </div>
              </div>

              <div style={{ background: '#F0FDFA', padding: '12px 14px', borderRadius: '10px', border: '1px solid #99F6E4' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F766E', textTransform: 'uppercase' }}>New Room</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F766E', marginTop: '4px' }}>
                  {newRoom}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Select Classroom / Space ({INITIAL_CLASSROOMS.length} Spaces)</label>
              <select 
                className="form-control" 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)}
              >
                {INITIAL_CLASSROOMS.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.type} &bull; Cap: {c.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Section 8 & 15: Student Notification Preview */}
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '13px',
              color: '#166534'
            }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Bell size={15} />
                <span>Automatic Notification Preview for Students:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#15803D' }}>
                &ldquo;Room Changed: {lecture.subject} will now be conducted in <strong>{newRoom}</strong>.&rdquo;
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#0D9488' }}>
              <CheckCircle size={15} />
              <span>Confirm Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
