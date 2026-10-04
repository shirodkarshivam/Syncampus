import React, { useState } from 'react';
import { X, CalendarClock, Users } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import { INITIAL_CLASSROOMS } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmReschedule: (id: string, newTime: string, newRoom: string) => void;
}

export const TeacherRescheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmReschedule
}) => {
  const [newTime, setNewTime] = useState('02:00 - 03:00');
  const [newRoom, setNewRoom] = useState('Room 204');

  if (!isOpen || !lecture) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReschedule(lecture.id, newTime, newRoom);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} color="#2563EB" />
            <h3 className="modal-title">Reschedule Lecture</h3>
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
                {lecture.course} &bull; Semester {lecture.semester} &bull; Division {lecture.division}
              </p>
            </div>

            {/* Current vs New preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                  {lecture.time}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lecture.room}</div>
              </div>

              <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase' }}>New Schedule</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D4ED8', marginTop: '4px' }}>
                  {newTime}
                </div>
                <div style={{ fontSize: '12px', color: '#2563EB' }}>{newRoom}</div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>New Time Slot</label>
                <select 
                  className="form-control" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  <option value="09:00 - 10:00">09:00 - 10:00 AM</option>
                  <option value="11:00 - 12:00">11:00 - 12:00 PM</option>
                  <option value="01:00 - 02:00">01:00 - 02:00 PM</option>
                  <option value="02:00 - 03:00">02:00 - 03:00 PM</option>
                  <option value="03:00 - 04:00">03:00 - 04:00 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Room ({INITIAL_CLASSROOMS.length} Spaces)</label>
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
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '12px 14px',
              borderRadius: '10px',
              color: '#1E40AF',
              fontSize: '13px',
              fontWeight: 500
            }}>
              <Users size={18} />
              <span>This change will automatically update the timetable for affected students.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Go Back
            </button>
            <button type="submit" className="btn-primary">
              Confirm Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
